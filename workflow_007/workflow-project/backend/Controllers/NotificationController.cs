using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WorkflowManagementSystem.Services;

namespace WorkflowManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("my-notifications")]
        public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var notifications = await _notificationService.GetUserNotifications(userId, unreadOnly);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NOTIFICATION] Error fetching notifications: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch notifications", error = ex.Message });
            }
        }

        [HttpPost("mark-read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var result = await _notificationService.MarkNotificationAsRead(notificationId);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to mark as read", error = ex.Message });
            }
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var result = await _notificationService.MarkAllAsRead(userId);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to mark all as read", error = ex.Message });
            }
        }

        [HttpGet("forms-by-role")]
        public async Task<IActionResult> GetFormsByRole()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(userRole))
                {
                    return BadRequest(new { message = "User role not found" });
                }

                var forms = await _notificationService.GetFormsByRole(userRole);
                return Ok(forms);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NOTIFICATION] Error fetching forms by role: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch forms", error = ex.Message });
            }
        }
    }
}
