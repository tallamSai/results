using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkflowManagementSystem.Services;
using System.Security.Claims;

namespace WorkflowManagementSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkflowEngineController : ControllerBase
    {
        private readonly WorkflowEngineService _workflowEngine;
        private readonly ILogger<WorkflowEngineController> _logger;

        public WorkflowEngineController(
            WorkflowEngineService workflowEngine,
            ILogger<WorkflowEngineController> logger)
        {
            _workflowEngine = workflowEngine;
            _logger = logger;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitForm([FromBody] FormSubmissionRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var result = await _workflowEngine.InitiateWorkflow(
                    userId, userEmail, userName, userRole,
                    request.FormType, request.FormData);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting form");
                return StatusCode(500, new { message = "Failed to submit form" });
            }
        }

        [HttpGet("pending-tasks")]
        public async Task<IActionResult> GetPendingTasks()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var tasks = await _workflowEngine.GetPendingTasksForRole(userRole);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending tasks");
                return StatusCode(500, new { message = "Failed to fetch pending tasks" });
            }
        }

        [HttpGet("my-submissions")]
        public async Task<IActionResult> GetMySubmissions()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var submissions = await _workflowEngine.GetMySubmissions(userId);
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching my submissions");
                return StatusCode(500, new { message = "Failed to fetch submissions" });
            }
        }

        [HttpGet("workflow-instance/{workflowInstanceId}")]
        public async Task<IActionResult> GetWorkflowInstance(int workflowInstanceId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var workflow = await _workflowEngine.GetWorkflowInstanceDetails(workflowInstanceId, userId);
                
                if (workflow == null)
                {
                    return NotFound(new { message = "Workflow not found" });
                }

                return Ok(workflow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching workflow instance {workflowInstanceId}");
                return StatusCode(500, new { message = "Failed to fetch workflow" });
            }
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetTaskDetails(int taskId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var taskDetails = await _workflowEngine.GetTaskDetails(taskId, userRole);
                
                if (taskDetails == null)
                {
                    return NotFound(new { message = "Task not found" });
                }

                return Ok(taskDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching task details for {taskId}");
                return StatusCode(500, new { message = "Failed to fetch task details" });
            }
        }

        [HttpGet("task/{taskId}/formdata")]
        public async Task<IActionResult> GetTaskFormData(int taskId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var formData = await _workflowEngine.GetTaskFormData(taskId, userRole);
                
                return Ok(new { formData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching FormData for task {taskId}");
                return StatusCode(500, new { message = "Failed to fetch task FormData" });
            }
        }

        [HttpGet("workflow/{workflowInstanceId}/initiator-formdata")]
        public async Task<IActionResult> GetInitiatorFormData(int workflowInstanceId)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var formData = await _workflowEngine.GetInitiatorFormData(workflowInstanceId, userRole);
                
                return Ok(new { formData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching initiator FormData for workflow {workflowInstanceId}");
                return StatusCode(500, new { message = "Failed to fetch initiator FormData" });
            }
        }

        [HttpPost("task/{taskId}/approve")]
        public async Task<IActionResult> ApproveTask(int taskId, [FromBody] TaskActionRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var result = await _workflowEngine.ProcessTaskAction(
                    taskId, userId, userName, userRole, "approve",
                    request.TaskData ?? new Dictionary<string, object>(),
                    request.Comments);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error approving task {taskId}");
                return StatusCode(500, new { message = "Failed to approve task" });
            }
        }

        [HttpPost("task/{taskId}/deny")]
        public async Task<IActionResult> DenyTask(int taskId, [FromBody] TaskActionRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var result = await _workflowEngine.ProcessTaskAction(
                    taskId, userId, userName, userRole, "deny",
                    request.TaskData ?? new Dictionary<string, object>(),
                    request.Comments);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error denying task {taskId}");
                return StatusCode(500, new { message = "Failed to deny task" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllWorkflows([FromQuery] string status = null)
        {
            try
            {
                var workflows = await _workflowEngine.GetAllWorkflows(status);
                return Ok(workflows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all workflows");
                return StatusCode(500, new { message = "Failed to fetch workflows" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{workflowInstanceId}/history")]
        public async Task<IActionResult> GetWorkflowHistory(int workflowInstanceId)
        {
            try
            {
                var history = await _workflowEngine.GetWorkflowHistory(workflowInstanceId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching workflow history for {workflowInstanceId}");
                return StatusCode(500, new { message = "Failed to fetch workflow history" });
            }
        }
    }

    public class FormSubmissionRequest
    {
        public string FormType { get; set; }
        public Dictionary<string, object> FormData { get; set; }
    }

    public class TaskActionRequest
    {
        public Dictionary<string, object> TaskData { get; set; }
        public string Comments { get; set; }
    }
}
