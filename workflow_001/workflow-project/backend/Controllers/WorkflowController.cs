using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WorkflowManagementSystem.Services;
using WorkflowManagementSystem.Models;

namespace WorkflowManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkflowController : ControllerBase
    {
        private readonly WorkflowService _workflowService;

        public WorkflowController(WorkflowService workflowService)
        {
            _workflowService = workflowService;
        }

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiateWorkflow([FromBody] InitiateWorkflowRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var workflowInstanceId = await _workflowService.InitiateWorkflow(
                    userId,
                    userRole,
                    request.WorkflowName,
                    request.FormType,
                    request.FormData
                );

                return Ok(new { workflowInstanceId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WORKFLOW] Error initiating workflow: {ex.Message}");
                return StatusCode(500, new { message = "Failed to initiate workflow", error = ex.Message });
            }
        }

        [HttpGet("my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var tasks = await _workflowService.GetMyTasks(userId, userRole);

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WORKFLOW] Error fetching tasks: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch tasks", error = ex.Message });
            }
        }

        [HttpPost("task/{taskId}/complete")]
        public async Task<IActionResult> CompleteTask(int taskId, [FromBody] CompleteTaskRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                var success = await _workflowService.CompleteTask(
                    taskId,
                    userId,
                    request.TaskData,
                    request.Comments
                );

                if (success)
                {
                    return Ok(new { message = "Task completed successfully" });
                }
                else
                {
                    return BadRequest(new { message = "Failed to complete task" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WORKFLOW] Error completing task: {ex.Message}");
                return StatusCode(500, new { message = "Failed to complete task", error = ex.Message });
            }
        }

        [HttpGet("instance/{workflowInstanceId}")]
        public async Task<IActionResult> GetWorkflowInstance(int workflowInstanceId)
        {
            try
            {
                var instance = await _workflowService.GetWorkflowInstance(workflowInstanceId);

                if (instance == null)
                {
                    return NotFound(new { message = "Workflow instance not found" });
                }

                return Ok(instance);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WORKFLOW] Error fetching workflow instance: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch workflow instance", error = ex.Message });
            }
        }
    }
}
