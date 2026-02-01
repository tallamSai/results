using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WorkflowManagementSystem.Services;
using WorkflowManagementSystem.Models;
using System.Security.Claims;

namespace WorkflowManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentManagerVerifiesgoodsorservicesreceivedController : ControllerBase
    {
        private readonly DatabaseService _dbService;
        private readonly NotificationService _notificationService;
        private readonly ILogger<DepartmentManagerVerifiesgoodsorservicesreceivedController> _logger;

        public DepartmentManagerVerifiesgoodsorservicesreceivedController(
            DatabaseService dbService,
            NotificationService notificationService,
            ILogger<DepartmentManagerVerifiesgoodsorservicesreceivedController> logger)
        {
            _dbService = dbService;
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitForm([FromBody] DepartmentManagerVerifiesgoodsorservicesreceivedData formData)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                _logger.LogInformation($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Submitting form for user: {{userId}}");

                if (userRole != "Department_Manager")
                {
                    return Forbid("You don't have permission to submit this form");
                }

                formData.UserId = int.Parse(userId);
                formData.Status = "Submitted";
                formData.SubmittedAt = DateTime.UtcNow;

                var formId = await _dbService.InsertFormData("DepartmentManagerVerifiesgoodsorservicesreceived", formData);

                var targetRoles = new[] { "Admin" };
                await _notificationService.SendFormNotifications(
                    formId,
                    "DepartmentManagerVerifiesgoodsorservicesreceived",
                    userRole,
                    targetRoles,
                    $"New {userRole} form submitted"
                );

                _logger.LogInformation($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Form submitted successfully: {{formId}}");

                return Ok(new { 
                    success = true,
                    formId = formId,
                    message = "Form submitted successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Error: {{ex.Message}}");
                return StatusCode(500, new { 
                    success = false,
                    message = "Error submitting form",
                    error = ex.Message 
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserForms()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var forms = await _dbService.GetUserFormsByRole(
                    "DepartmentManagerVerifiesgoodsorservicesreceived",
                    int.Parse(userId),
                    userRole
                );

                return Ok(new { success = true, forms = forms });
            }
            catch (Exception ex)
            {
                _logger.LogError($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Error getting forms: {{ex.Message}}");
                return StatusCode(500, new { 
                    success = false,
                    message = "Error retrieving forms",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFormById(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var form = await _dbService.GetFormById("DepartmentManagerVerifiesgoodsorservicesreceived", id);
                
                if (form == null)
                {
                    return NotFound(new { message = "Form not found" });
                }

                return Ok(new { success = true, form = form });
            }
            catch (Exception ex)
            {
                _logger.LogError($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Error getting form: {{ex.Message}}");
                return StatusCode(500, new { 
                    success = false,
                    message = "Error retrieving form",
                    error = ex.Message 
                });
            }
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveForm(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                await _dbService.UpdateFormStatus("DepartmentManagerVerifiesgoodsorservicesreceived", id, "Approved", int.Parse(userId));

                _logger.LogInformation($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Form approved: {{id}} by {{userRole}}");

                return Ok(new { 
                    success = true,
                    message = "Form approved successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Error approving form: {{ex.Message}}");
                return StatusCode(500, new { 
                    success = false,
                    message = "Error approving form",
                    error = ex.Message 
                });
            }
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectForm(int id, [FromBody] RejectRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                await _dbService.UpdateFormStatus(
                    "DepartmentManagerVerifiesgoodsorservicesreceived",
                    id,
                    "Rejected",
                    int.Parse(userId),
                    request.Reason
                );

                _logger.LogInformation($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Form rejected: {{id}} by {{userRole}}");

                return Ok(new { 
                    success = true,
                    message = "Form rejected successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"{{DateTime.Now}} - [DepartmentManagerVerifiesgoodsorservicesreceivedController] Error rejecting form: {{ex.Message}}");
                return StatusCode(500, new { 
                    success = false,
                    message = "Error rejecting form",
                    error = ex.Message 
                });
            }
        }
    }

}

namespace WorkflowManagementSystem.Models
{
    public class DepartmentManagerVerifiesgoodsorservicesreceivedData
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; } = "Submitted";
        public DateTime SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedBy { get; set; }
        public string? RejectionReason { get; set; }
        
        public Dictionary<string, object> FormFields { get; set; } = new();
    }
}
