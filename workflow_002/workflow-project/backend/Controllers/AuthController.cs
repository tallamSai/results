using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WorkflowManagementSystem.Services;
using WorkflowManagementSystem.Models;

namespace WorkflowManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly DatabaseService _dbService;

        public AuthController(IConfiguration configuration, DatabaseService dbService)
        {
            _configuration = configuration;
            _dbService = dbService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                Console.WriteLine($"[AUTH] Registration request for: {request.Email}");
                
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }
                
                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new { message = "Password is required" });
                }
                
                if (string.IsNullOrWhiteSpace(request.FirstName))
                {
                    return BadRequest(new { message = "First name is required" });
                }
                
                if (string.IsNullOrWhiteSpace(request.LastName))
                {
                    return BadRequest(new { message = "Last name is required" });
                }
                
                if (string.IsNullOrWhiteSpace(request.GenId))
                {
                    return BadRequest(new { message = "Gen ID is required" });
                }
                
                if (string.IsNullOrWhiteSpace(request.Role))
                {
                    return BadRequest(new { message = "Role is required" });
                }
                
                var existingUser = await _dbService.GetUserByEmail(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "User with this email already exists" });
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var user = new User
                {
                    Email = request.Email,
                    Password = hashedPassword,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    GenId = request.GenId,
                    ProfilePicture = request.ProfilePicture,
                    Role = request.Role,
                    CreatedAt = DateTime.UtcNow
                };

                Console.WriteLine($"[AUTH] Creating user: {request.Email} with GenId: {request.GenId}, Role: {request.Role}");
                await _dbService.CreateUser(user);
                Console.WriteLine($"[AUTH] User created successfully");

                return Ok(new { message = "User registered successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Registration error: {ex.Message}");
                Console.WriteLine($"[AUTH] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Registration failed", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"[AUTH] Login attempt for: {request.Email}");
                
                var user = await _dbService.GetUserByEmail(request.Email);
                
                if (user == null)
                {
                    Console.WriteLine($"[AUTH] User not found: {request.Email}");
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
                Console.WriteLine($"[AUTH] Password valid: {passwordValid}");
                
                if (!passwordValid)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                var token = GenerateJwtToken(user);
                Console.WriteLine($"[AUTH] Login successful for: {request.Email}");

                return Ok(new
                {
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        genId = user.GenId,
                        profilePicture = user.ProfilePicture,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Login error: {ex.Message}");
                return StatusCode(500, new { message = "Login failed", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim("genId", user.GenId)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string GenId { get; set; }
        public string ProfilePicture { get; set; }
        public string Role { get; set; }
    }
}
