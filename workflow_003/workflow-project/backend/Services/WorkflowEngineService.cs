using Microsoft.Data.SqlClient;
using WorkflowManagementSystem.Models;
using System.Text.Json;

namespace WorkflowManagementSystem.Services
{
    public class WorkflowEngineService
    {
        private readonly string _connectionString;
        private readonly NotificationService _notificationService;
        private readonly WorkflowConfigService _workflowConfig;
        private readonly ILogger<WorkflowEngineService> _logger;

        public WorkflowEngineService(
            IConfiguration configuration, 
            NotificationService notificationService,
            WorkflowConfigService workflowConfig,
            ILogger<WorkflowEngineService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _notificationService = notificationService;
            _workflowConfig = workflowConfig;
            _logger = logger;
        }

        #region Workflow Initiation

        public async Task<WorkflowInitiationResult> InitiateWorkflow(
            int userId, 
            string userEmail,
            string userName,
            string userRole,
            string formType, 
            Dictionary<string, object> formData)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var transaction = connection.BeginTransaction();

                try
                {
                    var workflowInstanceId = await CreateWorkflowInstance(
                        connection, transaction, userId, userEmail, userName, formType, formData);

                    var nextRole = GetNextRole(formType, userRole);

                    if (nextRole != null)
                    {
                        await CreateTaskForRole(
                            connection, transaction, workflowInstanceId, 
                            nextRole, formData, 1);

                        await UpdateWorkflowCurrentRole(
                            connection, transaction, workflowInstanceId, nextRole);
                    }

                    await LogWorkflowHistory(
                        connection, transaction, workflowInstanceId, null,
                        "Form Submitted", userId, userName, userRole,
                        null, "Active", null, nextRole, "Approved",
                        $"Form submitted by {userRole}", formData);

                    if (nextRole != null)
                    {
                        await NotifyRole(connection, transaction, nextRole, workflowInstanceId, 
                            userId, userName, userRole, formType, "form_submitted");
                    }

                    var submitterMessage = nextRole != null 
                        ? $"Your form has been submitted and forwarded to {nextRole}."
                        : "Your form has been submitted and forwarded to Admin.";
                        
                    await _notificationService.CreateNotification(
                        userId,
                        "Form Submitted Successfully",
                        submitterMessage,
                        "success",
                        formType,
                        workflowInstanceId,
                        workflowInstanceId
                    );

                    await transaction.CommitAsync();

                    _logger.LogInformation($"Workflow initiated: {{workflowInstanceId}} for user {{userId}}");

                    return new WorkflowInitiationResult
                    {
                        Success = true,
                        WorkflowInstanceId = workflowInstanceId,
                        NextRole = nextRole,
                        Message = "Form submitted successfully"
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate workflow");
                return new WorkflowInitiationResult
                {
                    Success = false,
                    Message = $"Failed to submit form: {ex.Message}"
                };
            }
        }

        #endregion

        #region Task Processing

        public async Task<WorkflowActionResult> ProcessTaskAction(
            int taskId,
            int userId,
            string userName,
            string userRole,
            string action,
            Dictionary<string, object> taskData,
            string comments)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                using var transaction = connection.BeginTransaction();

                try
                {
                    var taskInfo = await GetTaskInfo(connection, transaction, taskId);
                    if (taskInfo == null)
                    {
                        return new WorkflowActionResult 
                        { 
                            Success = false, 
                            Message = "Task not found" 
                        };
                    }

                    var workflowInstanceId = taskInfo.WorkflowInstanceId;
                    var initiatorId = taskInfo.InitiatorId;

                    await CompleteTask(connection, transaction, taskId, userId, userName, 
                        action, taskData, comments);

                    if (action.ToLower() == "approve")
                    {
                        var nextRole = GetNextRole(taskInfo.FormType, taskInfo.TaskRole, taskInfo.RoleAppearanceIndex);

                        if (nextRole != null)
                        {
                            await CreateTaskForRole(
                                connection, transaction, workflowInstanceId, 
                                nextRole, taskData, taskInfo.TaskSequence + 1);

                            await UpdateWorkflowCurrentRole(
                                connection, transaction, workflowInstanceId, nextRole);

                            await NotifyRole(connection, transaction, nextRole, workflowInstanceId, 
                                userId, userName, userRole, taskInfo.FormType, "task_assigned");
                        }
                        else
                        {
                            await CompleteWorkflow(connection, transaction, workflowInstanceId);

                            await _notificationService.CreateNotification(
                                initiatorId,
                                "Workflow Completed",
                                "Your form has been fully processed and approved by all reviewers.",
                                "success",
                                taskInfo.FormType,
                                taskId,
                                workflowInstanceId
                            );
                        }

                        await LogWorkflowHistory(
                            connection, transaction, workflowInstanceId, taskId,
                            "Task Approved", userId, userName, userRole,
                            "Pending", "Approved", userRole, nextRole, "Approved",
                            comments, taskData);

                        await _notificationService.CreateNotification(
                            userId,
                            "Form Approved Successfully",
                            $"You have approved the form. It has been forwarded to {nextRole ?? "completion"}.",
                            "success",
                            taskInfo.FormType,
                            taskId,
                            workflowInstanceId
                        );

                        var notificationMessage = nextRole != null 
                            ? $"Your form has been approved by {userRole}. Forwarded to {nextRole}."
                            : $"Your form has been approved by {userRole}. Workflow completed.";
                        
                        await _notificationService.CreateNotification(
                            initiatorId,
                            $"{userRole} Approved Your Form",
                            notificationMessage,
                            "success",
                            taskInfo.FormType,
                            taskId,
                            workflowInstanceId
                        );
                    }
                    else
                    {
                        await DenyWorkflow(connection, transaction, workflowInstanceId, 
                            userRole, comments);

                        await LogWorkflowHistory(
                            connection, transaction, workflowInstanceId, taskId,
                            "Task Denied", userId, userName, userRole,
                            "Pending", "Denied", userRole, null, "Denied",
                            comments, taskData);

                        await _notificationService.CreateNotification(
                            userId,
                            "Form Denied Successfully",
                            $"You have denied the form. The initiator has been notified.",
                            "warning",
                            taskInfo.FormType,
                            taskId,
                            workflowInstanceId
                        );

                        await _notificationService.CreateNotification(
                            initiatorId,
                            $"Form Denied by {userRole}",
                            $"Your form has been denied by {userRole}. Reason: {comments}",
                            "error",
                            taskInfo.FormType,
                            taskId,
                            workflowInstanceId
                        );

                        await NotifyAdmins(connection, transaction, workflowInstanceId, 
                            userId, userName, userRole, taskInfo.FormType, "workflow_denied");
                    }

                    await transaction.CommitAsync();

                    var resultNextRole = action.ToLower() == "approve" ? GetNextRole(taskInfo.FormType, taskInfo.TaskRole, taskInfo.RoleAppearanceIndex) : null;

                    return new WorkflowActionResult
                    {
                        Success = true,
                        Message = $"Form {action}d successfully",
                        WorkflowInstanceId = workflowInstanceId,
                        Action = action,
                        NextRole = resultNextRole
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to process task action: {{action}}");
                return new WorkflowActionResult
                {
                    Success = false,
                    Message = $"Failed to {{action}} form: {{ex.Message}}"
                };
            }
        }

        #endregion

        #region Pending Tasks

        public async Task<List<PendingTaskDto>> GetPendingTasksForRole(string role)
        {
            var tasks = new List<PendingTaskDto>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    wt.Id as TaskId,
                    wt.WorkflowInstanceId,
                    wt.TaskName,
                    wt.TaskRole,
                    wt.TaskSequence,
                    NULL as FormData,
                    wt.CreatedAt as TaskCreatedAt,
                    wi.FormType,
                    wi.InitiatorName,
                    wi.InitiatorEmail,
                    NULL as SubmittedFormData,
                    wi.CreatedAt as WorkflowCreatedAt,
                    wi.Status as WorkflowStatus
                FROM WorkflowTasks wt WITH (NOLOCK)
                INNER JOIN WorkflowInstances wi WITH (NOLOCK) ON wt.WorkflowInstanceId = wi.Id
                WHERE wt.AssignedToRole = @Role 
                    AND wt.Status = 'Pending'
                    AND wi.Status = 'Active'
                ORDER BY wt.CreatedAt DESC";

            var command = new SqlCommand(query, connection);
            command.CommandTimeout = 300;
            command.Parameters.AddWithValue("@Role", role);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                tasks.Add(new PendingTaskDto
                {
                    TaskId = reader.GetInt32(0),
                    WorkflowInstanceId = reader.GetInt32(1),
                    TaskName = reader.GetString(2),
                    TaskRole = reader.GetString(3),
                    TaskSequence = reader.GetInt32(4),
                    FormData = reader.IsDBNull(5) ? null : reader.GetString(5),
                    TaskCreatedAt = reader.GetDateTime(6),
                    FormType = reader.GetString(7),
                    InitiatorName = reader.IsDBNull(8) ? "" : reader.GetString(8),
                    InitiatorEmail = reader.IsDBNull(9) ? "" : reader.GetString(9),
                    SubmittedFormData = reader.IsDBNull(10) ? null : reader.GetString(10),
                    WorkflowCreatedAt = reader.GetDateTime(11),
                    WorkflowStatus = reader.GetString(12)
                });
            }

            return tasks;
        }

        public async Task<TaskDetailDto> GetTaskDetails(int taskId, string userRole)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    wt.Id,
                    wt.WorkflowInstanceId,
                    wt.TaskName,
                    wt.TaskRole,
                    wt.AssignedToRole,
                    wt.Status,
                    wt.TaskSequence,
                    wt.CreatedAt,
                    ISNULL(wt.FormType, wi.FormType) as FormType,  -- NEW: Use task's FormType if available, otherwise workflow's
                    wt.RoleAppearanceIndex,  -- NEW: For multi-form support
                    wi.InitiatorName,
                    wi.InitiatorEmail,
                    wi.CreatedAt as WorkflowCreatedAt,
                    u.Role as InitiatorRole
                FROM WorkflowTasks wt WITH (NOLOCK)
                INNER JOIN WorkflowInstances wi WITH (NOLOCK) ON wt.WorkflowInstanceId = wi.Id
                INNER JOIN Users u WITH (NOLOCK) ON wi.InitiatedBy = u.Id
                WHERE wt.Id = @TaskId";

            var command = new SqlCommand(query, connection);
            command.CommandTimeout = 10;
            command.Parameters.AddWithValue("@TaskId", taskId);

            TaskDetailDto taskDetail = null;
            using (var reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    var roleAppearanceIndex = reader.IsDBNull(reader.GetOrdinal("RoleAppearanceIndex")) ? 0 : reader.GetInt32(reader.GetOrdinal("RoleAppearanceIndex"));
                    var taskRole = reader.GetString(reader.GetOrdinal("TaskRole"));
                    
                    taskDetail = new TaskDetailDto
                    {
                        TaskId = reader.GetInt32(reader.GetOrdinal("Id")),
                        WorkflowInstanceId = reader.GetInt32(reader.GetOrdinal("WorkflowInstanceId")),
                        TaskName = reader.GetString(reader.GetOrdinal("TaskName")),
                        TaskRole = taskRole,
                        Status = reader.GetString(reader.GetOrdinal("Status")),
                        FormType = reader.GetString(reader.GetOrdinal("FormType")),
                        RoleAppearanceIndex = roleAppearanceIndex,
                        InitiatorName = reader.IsDBNull(reader.GetOrdinal("InitiatorName")) ? "" : reader.GetString(reader.GetOrdinal("InitiatorName")),
                        InitiatorEmail = reader.IsDBNull(reader.GetOrdinal("InitiatorEmail")) ? "" : reader.GetString(reader.GetOrdinal("InitiatorEmail")),
                        InitiatorRole = reader.IsDBNull(reader.GetOrdinal("InitiatorRole")) ? "" : reader.GetString(reader.GetOrdinal("InitiatorRole")),
                        SubmittedFormData = null,
                        TaskFormData = null,
                        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                        PreviousCompletedTasks = new List<CompletedTaskDto>()
                    };
                    
                    _logger.LogInformation("[TaskRetrieval] Task {{TaskId}}: Role={{Role}}, RoleAppearanceIndex={{RoleAppearanceIndex}}, FormType={{FormType}}", taskDetail.TaskId, taskRole, roleAppearanceIndex, taskDetail.FormType);
                }
            }

            if (taskDetail != null)
            {
                var previousTasksQuery = @"
                    SELECT 
                        Id, TaskRole, TaskName, NULL as FormData, CompletedByName, 
                        CompletedAt, Decision, Comments, ISNULL(RoleAppearanceIndex, 0) as RoleAppearanceIndex
                    FROM WorkflowTasks WITH (NOLOCK)
                    WHERE WorkflowInstanceId = @WorkflowInstanceId
                        AND TaskSequence < (SELECT TaskSequence FROM WorkflowTasks WHERE Id = @TaskId)
                        AND Status IN ('Approved', 'Completed')
                    ORDER BY TaskSequence ASC";

                var prevCmd = new SqlCommand(previousTasksQuery, connection);
                prevCmd.CommandTimeout = 60;
                prevCmd.Parameters.AddWithValue("@WorkflowInstanceId", taskDetail.WorkflowInstanceId);
                prevCmd.Parameters.AddWithValue("@TaskId", taskId);

                using var prevReader = await prevCmd.ExecuteReaderAsync();
                while (await prevReader.ReadAsync())
                {
                    taskDetail.PreviousCompletedTasks.Add(new CompletedTaskDto
                    {
                        TaskId = prevReader.GetInt32(prevReader.GetOrdinal("Id")),
                        TaskRole = prevReader.GetString(prevReader.GetOrdinal("TaskRole")),
                        TaskName = prevReader.GetString(prevReader.GetOrdinal("TaskName")),
                        FormData = null,
                        CompletedByName = prevReader.IsDBNull(prevReader.GetOrdinal("CompletedByName")) ? "" : prevReader.GetString(prevReader.GetOrdinal("CompletedByName")),
                        CompletedAt = prevReader.IsDBNull(prevReader.GetOrdinal("CompletedAt")) ? DateTime.MinValue : prevReader.GetDateTime(prevReader.GetOrdinal("CompletedAt")),
                        Decision = prevReader.IsDBNull(prevReader.GetOrdinal("Decision")) ? "" : prevReader.GetString(prevReader.GetOrdinal("Decision")),
                        Comments = prevReader.IsDBNull(prevReader.GetOrdinal("Comments")) ? "" : prevReader.GetString(prevReader.GetOrdinal("Comments")),
                        RoleAppearanceIndex = prevReader.GetInt32(prevReader.GetOrdinal("RoleAppearanceIndex"))
                    });
                }
            }

            return taskDetail;
        }

        public async Task<string> GetTaskFormData(int taskId, string userRole)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT FormData 
                FROM WorkflowTasks WITH (NOLOCK)
                WHERE Id = @TaskId";

            var command = new SqlCommand(query, connection);
            command.CommandTimeout = 120;
            command.Parameters.AddWithValue("@TaskId", taskId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return reader.IsDBNull(0) ? "{}" : reader.GetString(0);
            }

            return "{}";
        }

        public async Task<string> GetInitiatorFormData(int workflowInstanceId, string userRole)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT SubmittedFormData 
                FROM WorkflowInstances WITH (NOLOCK)
                WHERE Id = @WorkflowInstanceId";

            var command = new SqlCommand(query, connection);
            command.CommandTimeout = 120;
            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return reader.IsDBNull(0) ? "{}" : reader.GetString(0);
            }

            return "{}";
        }

        #endregion

        #region My Submissions

        public async Task<List<MySubmissionDto>> GetMySubmissions(int userId)
        {
            var submissions = new List<MySubmissionDto>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    wi.Id,
                    wi.WorkflowName,
                    wi.FormType,
                    wi.InitiatorName,
                    wi.InitiatorEmail,
                    wi.CurrentRole,
                    wi.Status,
                    wi.CreatedAt,
                    wi.CompletedAt,
                    wi.SubmittedFormData
                FROM WorkflowInstances wi WITH (NOLOCK)
                WHERE wi.InitiatedBy = @UserId
                ORDER BY wi.CreatedAt DESC";

            var command = new SqlCommand(query, connection);
            command.CommandTimeout = 30;
            command.Parameters.AddWithValue("@UserId", userId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                submissions.Add(new MySubmissionDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    WorkflowInstanceId = reader.GetInt32(reader.GetOrdinal("Id")),
                    FormType = reader.GetString(reader.GetOrdinal("FormType")),
                    SubmitterName = reader.IsDBNull(reader.GetOrdinal("InitiatorName")) ? "" : reader.GetString(reader.GetOrdinal("InitiatorName")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    SubmittedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    FormData = reader.IsDBNull(reader.GetOrdinal("SubmittedFormData")) ? "{}" : reader.GetString(reader.GetOrdinal("SubmittedFormData"))
                });
            }

            _logger.LogInformation($"Retrieved {{submissions.Count}} submissions for user {{userId}}");

            return submissions;
        }

        public async Task<WorkflowInstanceDetailDto> GetWorkflowInstanceDetails(int workflowInstanceId, int userId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    wi.Id,
                    wi.WorkflowName,
                    wi.FormType,
                    wi.InitiatorName,
                    wi.InitiatorEmail,
                    wi.InitiatedBy,
                    wi.CurrentRole,
                    wi.Status,
                    wi.CreatedAt,
                    wi.CompletedAt,
                    wi.SubmittedFormData
                FROM WorkflowInstances wi WITH (NOLOCK)
                WHERE wi.Id = @WorkflowInstanceId AND wi.InitiatedBy = @UserId";

            var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@UserId", userId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new WorkflowInstanceDetailDto
                {
                    WorkflowInstanceId = reader.GetInt32(reader.GetOrdinal("Id")),
                    FormType = reader.GetString(reader.GetOrdinal("FormType")),
                    SubmitterName = reader.IsDBNull(reader.GetOrdinal("InitiatorName")) ? "" : reader.GetString(reader.GetOrdinal("InitiatorName")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    SubmittedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    FormData = reader.IsDBNull(reader.GetOrdinal("SubmittedFormData")) ? "{}" : reader.GetString(reader.GetOrdinal("SubmittedFormData"))
                };
            }

            return null;
        }

        #endregion

        #region Admin Functions

        public async Task<List<WorkflowSummaryDto>> GetAllWorkflows(string status = null)
        {
            var workflows = new List<WorkflowSummaryDto>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    wi.Id,
                    wi.WorkflowName,
                    wi.FormType,
                    wi.InitiatorName,
                    wi.InitiatorEmail,
                    wi.CurrentRole,
                    wi.Status,
                    wi.CreatedAt,
                    wi.CompletedAt,
                    NULL as SubmittedFormData, -- Exclude FormData for list view performance
                    (SELECT COUNT(*) FROM WorkflowTasks WHERE WorkflowInstanceId = wi.Id) as TotalTasks,
                    (SELECT COUNT(*) FROM WorkflowTasks WHERE WorkflowInstanceId = wi.Id AND Status = 'Completed') as CompletedTasks,
                    (SELECT COUNT(*) FROM WorkflowTasks WHERE WorkflowInstanceId = wi.Id AND Status = 'Pending') as PendingTasks
                FROM WorkflowInstances wi WITH (NOLOCK)
                WHERE (@Status IS NULL OR wi.Status = @Status)
                ORDER BY wi.CreatedAt DESC";

            var command = new SqlCommand(query, connection);
            command.CommandTimeout = 30;
            command.Parameters.AddWithValue("@Status", (object)status ?? DBNull.Value);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                workflows.Add(new WorkflowSummaryDto
                {
                    WorkflowInstanceId = reader.GetInt32(reader.GetOrdinal("Id")),
                    WorkflowName = reader.GetString(reader.GetOrdinal("WorkflowName")),
                    FormType = reader.GetString(reader.GetOrdinal("FormType")),
                    InitiatorName = reader.IsDBNull(reader.GetOrdinal("InitiatorName")) ? "" : reader.GetString(reader.GetOrdinal("InitiatorName")),
                    CurrentRole = reader.IsDBNull(reader.GetOrdinal("CurrentRole")) ? "" : reader.GetString(reader.GetOrdinal("CurrentRole")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    CompletedAt = reader.IsDBNull(reader.GetOrdinal("CompletedAt")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CompletedAt")),
                    TotalTasks = reader.GetInt32(reader.GetOrdinal("TotalTasks")),
                    CompletedTasks = reader.GetInt32(reader.GetOrdinal("CompletedTasks")),
                    PendingTasks = reader.GetInt32(reader.GetOrdinal("PendingTasks"))
                });
            }

            return workflows;
        }

        public async Task<List<WorkflowHistoryDto>> GetWorkflowHistory(int workflowInstanceId)
        {
            var history = new List<WorkflowHistoryDto>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT *
                FROM WorkflowHistory
                WHERE WorkflowInstanceId = @WorkflowInstanceId
                ORDER BY Timestamp ASC";

            var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                history.Add(new WorkflowHistoryDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    WorkflowInstanceId = reader.GetInt32(reader.GetOrdinal("WorkflowInstanceId")),
                    Action = reader.GetString(reader.GetOrdinal("Action")),
                    PerformedByName = reader.GetString(reader.GetOrdinal("PerformedByName")),
                    PerformedByRole = reader.GetString(reader.GetOrdinal("PerformedByRole")),
                    FromStatus = reader.IsDBNull(reader.GetOrdinal("FromStatus")) ? null : reader.GetString(reader.GetOrdinal("FromStatus")),
                    ToStatus = reader.IsDBNull(reader.GetOrdinal("ToStatus")) ? null : reader.GetString(reader.GetOrdinal("ToStatus")),
                    FromRole = reader.IsDBNull(reader.GetOrdinal("FromRole")) ? null : reader.GetString(reader.GetOrdinal("FromRole")),
                    ToRole = reader.IsDBNull(reader.GetOrdinal("ToRole")) ? null : reader.GetString(reader.GetOrdinal("ToRole")),
                    Decision = reader.IsDBNull(reader.GetOrdinal("Decision")) ? null : reader.GetString(reader.GetOrdinal("Decision")),
                    Comments = reader.IsDBNull(reader.GetOrdinal("Comments")) ? null : reader.GetString(reader.GetOrdinal("Comments")),
                    Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp"))
                });
            }

            return history;
        }

        #endregion

        #region Helper Methods

        private async Task<int> CreateWorkflowInstance(
            SqlConnection connection, 
            SqlTransaction transaction,
            int userId,
            string userEmail,
            string userName,
            string formType,
            Dictionary<string, object> formData)
        {
            var command = new SqlCommand(
                @"INSERT INTO WorkflowInstances 
                    (WorkflowName, FormType, InitiatedBy, InitiatorEmail, InitiatorName, 
                     SubmittedFormData, Status, CreatedAt)
                  OUTPUT INSERTED.Id
                  VALUES (@WorkflowName, @FormType, @InitiatedBy, @InitiatorEmail, @InitiatorName,
                          @SubmittedFormData, @Status, @CreatedAt)",
                connection, transaction);

            var workflowName = $"{formType.Replace("-", " ")} Workflow";
            command.Parameters.AddWithValue("@WorkflowName", workflowName);
            command.Parameters.AddWithValue("@FormType", formType);
            command.Parameters.AddWithValue("@InitiatedBy", userId);
            command.Parameters.AddWithValue("@InitiatorEmail", userEmail);
            command.Parameters.AddWithValue("@InitiatorName", userName);
            command.Parameters.AddWithValue("@SubmittedFormData", JsonSerializer.Serialize(formData));
            command.Parameters.AddWithValue("@Status", "Active");
            command.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            return (int)await command.ExecuteScalarAsync();
        }

        private async Task CreateTaskForRole(
            SqlConnection connection,
            SqlTransaction transaction,
            int workflowInstanceId,
            string role,
            Dictionary<string, object> formData,
            int sequence,
            string formType = null)
        {
            var roleAppearanceIndex = _workflowConfig.GetRoleAppearanceIndex(workflowInstanceId, role, connection, transaction);
            
            var command = new SqlCommand(
                @"INSERT INTO WorkflowTasks 
                    (WorkflowInstanceId, TaskId, TaskName, TaskRole, TaskSequence, AssignedToRole, 
                     FormData, Status, CreatedAt, FormType, RoleAppearanceIndex)
                  VALUES (@WorkflowInstanceId, @TaskId, @TaskName, @TaskRole, @TaskSequence, 
                          @AssignedToRole, @FormData, @Status, @CreatedAt, @FormType, @RoleAppearanceIndex)",
                connection, transaction);

            var taskId = $"Task_{role}_{sequence}";
            var taskName = $"Review and Process - {role}";
            
            var actualFormType = formType ?? role;

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@TaskId", taskId);
            command.Parameters.AddWithValue("@TaskName", taskName);
            command.Parameters.AddWithValue("@TaskRole", role);
            command.Parameters.AddWithValue("@TaskSequence", sequence);
            command.Parameters.AddWithValue("@AssignedToRole", role);
            command.Parameters.AddWithValue("@FormData", JsonSerializer.Serialize(formData));
            command.Parameters.AddWithValue("@Status", "Pending");
            command.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@FormType", actualFormType);
            command.Parameters.AddWithValue("@RoleAppearanceIndex", roleAppearanceIndex);

            _logger.LogInformation("[TaskCreation] Creating task for {{Role}}: TaskId={{TaskId}}, Sequence={{Sequence}}, RoleAppearanceIndex={{RoleAppearanceIndex}}, FormType={{FormType}}", role, taskId, sequence, roleAppearanceIndex, actualFormType);

            await command.ExecuteNonQueryAsync();
        }

        private string GetNextRole(string formType, string currentRole, int roleAppearanceIndex = 0)
        {
            return _workflowConfig.GetNextRole(formType, currentRole, roleAppearanceIndex);
        }

        private async Task UpdateWorkflowCurrentRole(
            SqlConnection connection,
            SqlTransaction transaction,
            int workflowInstanceId,
            string nextRole)
        {
            var command = new SqlCommand(
                @"UPDATE WorkflowInstances 
                  SET CurrentRole = @CurrentRole, NextRole = @NextRole, UpdatedAt = @UpdatedAt
                  WHERE Id = @WorkflowInstanceId",
                connection, transaction);

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@CurrentRole", nextRole);
            command.Parameters.AddWithValue("@NextRole", DBNull.Value);
            command.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        private async Task CompleteTask(
            SqlConnection connection,
            SqlTransaction transaction,
            int taskId,
            int userId,
            string userName,
            string action,
            Dictionary<string, object> taskData,
            string comments)
        {
            var command = new SqlCommand(
                @"UPDATE WorkflowTasks 
                  SET Status = @Status, 
                      Decision = @Decision,
                      CompletedBy = @CompletedBy,
                      CompletedByName = @CompletedByName,
                      CompletedAt = @CompletedAt,
                      FormData = @FormData,
                      Comments = @Comments
                  WHERE Id = @TaskId",
                connection, transaction);

            command.Parameters.AddWithValue("@TaskId", taskId);
            command.Parameters.AddWithValue("@Status", action.ToLower() == "approve" ? "Approved" : "Denied");
            command.Parameters.AddWithValue("@Decision", action);
            command.Parameters.AddWithValue("@CompletedBy", userId);
            command.Parameters.AddWithValue("@CompletedByName", userName);
            command.Parameters.AddWithValue("@CompletedAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@FormData", JsonSerializer.Serialize(taskData));
            command.Parameters.AddWithValue("@Comments", comments ?? "");

            await command.ExecuteNonQueryAsync();
        }

        private async Task CompleteWorkflow(
            SqlConnection connection,
            SqlTransaction transaction,
            int workflowInstanceId)
        {
            var command = new SqlCommand(
                @"UPDATE WorkflowInstances 
                  SET Status = @Status, CompletedAt = @CompletedAt, UpdatedAt = @UpdatedAt
                  WHERE Id = @WorkflowInstanceId",
                connection, transaction);

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@Status", "Completed");
            command.Parameters.AddWithValue("@CompletedAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        private async Task DenyWorkflow(
            SqlConnection connection,
            SqlTransaction transaction,
            int workflowInstanceId,
            string deniedByRole,
            string reason)
        {
            var command = new SqlCommand(
                @"UPDATE WorkflowInstances 
                  SET Status = @Status, CompletedAt = @CompletedAt, UpdatedAt = @UpdatedAt
                  WHERE Id = @WorkflowInstanceId",
                connection, transaction);

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@Status", $"Denied by {deniedByRole}");
            command.Parameters.AddWithValue("@CompletedAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        private async Task LogWorkflowHistory(
            SqlConnection connection,
            SqlTransaction transaction,
            int workflowInstanceId,
            int? taskId,
            string action,
            int userId,
            string userName,
            string userRole,
            string fromStatus,
            string toStatus,
            string fromRole,
            string toRole,
            string decision,
            string comments,
            Dictionary<string, object> formData = null)
        {
            var command = new SqlCommand(
                @"INSERT INTO WorkflowHistory 
                    (WorkflowInstanceId, TaskId, Action, PerformedBy, PerformedByName, PerformedByRole,
                     FromStatus, ToStatus, FromRole, ToRole, Decision, Comments, FormDataSnapshot, Timestamp)
                  VALUES (@WorkflowInstanceId, @TaskId, @Action, @PerformedBy, @PerformedByName, @PerformedByRole,
                          @FromStatus, @ToStatus, @FromRole, @ToRole, @Decision, @Comments, @FormDataSnapshot, @Timestamp)",
                connection, transaction);

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@TaskId", (object)taskId ?? DBNull.Value);
            command.Parameters.AddWithValue("@Action", action);
            command.Parameters.AddWithValue("@PerformedBy", userId);
            command.Parameters.AddWithValue("@PerformedByName", userName);
            command.Parameters.AddWithValue("@PerformedByRole", userRole);
            command.Parameters.AddWithValue("@FromStatus", (object)fromStatus ?? DBNull.Value);
            command.Parameters.AddWithValue("@ToStatus", (object)toStatus ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromRole", (object)fromRole ?? DBNull.Value);
            command.Parameters.AddWithValue("@ToRole", (object)toRole ?? DBNull.Value);
            command.Parameters.AddWithValue("@Decision", (object)decision ?? DBNull.Value);
            command.Parameters.AddWithValue("@Comments", (object)comments ?? DBNull.Value);
            command.Parameters.AddWithValue("@FormDataSnapshot", formData != null ? JsonSerializer.Serialize(formData) : (object)DBNull.Value);
            command.Parameters.AddWithValue("@Timestamp", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        private async Task NotifyRole(
            SqlConnection connection,
            SqlTransaction transaction,
            string role,
            int workflowInstanceId,
            int fromUserId,
            string fromUserName,
            string fromUserRole,
            string formType,
            string notificationType)
        {
            var getUsersCmd = new SqlCommand(
                "SELECT Id FROM Users WHERE Role = @Role",
                connection, transaction);
            getUsersCmd.Parameters.AddWithValue("@Role", role);

            var userIds = new List<int>();
            using var reader = await getUsersCmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                userIds.Add(reader.GetInt32(0));
            }

            foreach (var userId in userIds)
            {
                string title = notificationType == "form_submitted" 
                    ? $"New Form from {fromUserRole}"
                    : $"Task Assigned - {formType}";
                
                string message = notificationType == "form_submitted"
                    ? $"{fromUserName} ({fromUserRole}) has submitted a form. Please review and take action."
                    : $"A task has been assigned to {role}. Please review and process.";

                await _notificationService.CreateNotification(
                    userId, title, message, "info", formType, 
                    workflowInstanceId, workflowInstanceId,
                    fromUserId, fromUserName, fromUserRole);
            }
        }

        private async Task NotifyAdmins(
            SqlConnection connection,
            SqlTransaction transaction,
            int workflowInstanceId,
            int fromUserId,
            string fromUserName,
            string fromUserRole,
            string formType,
            string notificationType)
        {
            await NotifyRole(connection, transaction, "Admin", workflowInstanceId, fromUserId, fromUserName, fromUserRole, formType, notificationType);
        }

        private async Task<TaskInfoDto> GetTaskInfo(SqlConnection connection, SqlTransaction transaction, int taskId)
        {
            var command = new SqlCommand(
                @"SELECT wt.WorkflowInstanceId, wt.TaskSequence, wi.FormType, wi.InitiatedBy, wt.RoleAppearanceIndex, wt.TaskRole
                  FROM WorkflowTasks wt
                  INNER JOIN WorkflowInstances wi ON wt.WorkflowInstanceId = wi.Id
                  WHERE wt.Id = @TaskId",
                connection, transaction);
            command.Parameters.AddWithValue("@TaskId", taskId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new TaskInfoDto
                {
                    WorkflowInstanceId = reader.GetInt32(0),
                    TaskSequence = reader.GetInt32(1),
                    FormType = reader.GetString(2),
                    InitiatorId = reader.GetInt32(3),
                    RoleAppearanceIndex = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),
                    TaskRole = reader.GetString(5)
                };
            }

            return null;
        }

        #region Debug Endpoints
        
        public async Task<WorkflowDebugInfo> GetWorkflowDebugInfo(int workflowInstanceId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var debug = new WorkflowDebugInfo
            {
                WorkflowInstanceId = workflowInstanceId,
                Tasks = new List<TaskDebugInfo>()
            };
            
            var wiCmd = new SqlCommand(
                @"SELECT FormType, CurrentRole, Status, InitiatorName, CreatedAt 
                  FROM WorkflowInstances WHERE Id = @Id", connection);
            wiCmd.Parameters.AddWithValue("@Id", workflowInstanceId);
            
            using (var reader = await wiCmd.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    debug.FormType = reader.GetString(0);
                    debug.CurrentRole = reader.GetString(1);
                    debug.Status = reader.GetString(2);
                    debug.InitiatorName = reader.GetString(3);
                    debug.CreatedAt = reader.GetDateTime(4);
                }
            }
            
            var tasksCmd = new SqlCommand(
                @"SELECT Id, TaskId, TaskRole, TaskSequence, Status, FormType, 
                         RoleAppearanceIndex, CreatedAt, CompletedAt
                  FROM WorkflowTasks 
                  WHERE WorkflowInstanceId = @WorkflowInstanceId
                  ORDER BY TaskSequence, CreatedAt", connection);
            tasksCmd.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            
            using (var reader = await tasksCmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    debug.Tasks.Add(new TaskDebugInfo
                    {
                        Id = reader.GetInt32(0),
                        TaskId = reader.GetString(1),
                        Role = reader.GetString(2),
                        Sequence = reader.GetInt32(3),
                        Status = reader.GetString(4),
                        FormType = reader.IsDBNull(5) ? null : reader.GetString(5),
                        RoleAppearanceIndex = reader.IsDBNull(6) ? 0 : reader.GetInt32(6),
                        CreatedAt = reader.GetDateTime(7),
                        CompletedAt = reader.IsDBNull(8) ? null : reader.GetDateTime(8)
                    });
                }
            }
            
            debug.RoleAppearanceCounts = new Dictionary<string, int>();
            foreach (var task in debug.Tasks)
            {
                if (!debug.RoleAppearanceCounts.ContainsKey(task.Role))
                    debug.RoleAppearanceCounts[task.Role] = 0;
                debug.RoleAppearanceCounts[task.Role]++;
            }
            
            return debug;
        }
        
        #endregion

        #endregion
    }

    #region DTOs

    public class WorkflowInitiationResult
    {
        public bool Success { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string NextRole { get; set; }
        public string Message { get; set; }
    }

    public class WorkflowActionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string Action { get; set; }
        public string NextRole { get; set; }
    }

    public class PendingTaskDto
    {
        public int TaskId { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string TaskName { get; set; }
        public string TaskRole { get; set; }
        public int TaskSequence { get; set; }
        public string FormData { get; set; }
        public DateTime TaskCreatedAt { get; set; }
        public string FormType { get; set; }
        public string InitiatorName { get; set; }
        public string InitiatorEmail { get; set; }
        public string SubmittedFormData { get; set; }
        public DateTime WorkflowCreatedAt { get; set; }
        public string WorkflowStatus { get; set; }
        
        public int Id => TaskId;
        public string SubmitterName => InitiatorName;
        public DateTime SubmittedAt => WorkflowCreatedAt;
        public string Status => WorkflowStatus;
    }

    public class TaskDetailDto
    {
        public int TaskId { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string TaskName { get; set; }
        public string TaskRole { get; set; }
        public string Status { get; set; }
        public string FormType { get; set; }
        public int RoleAppearanceIndex { get; set; }
        public string InitiatorName { get; set; }
        public string InitiatorEmail { get; set; }
        public string InitiatorRole { get; set; }
        public string SubmittedFormData { get; set; }
        public string TaskFormData { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CompletedTaskDto> PreviousCompletedTasks { get; set; }
        
        public int Id => TaskId;
        public string SubmitterName => InitiatorName;
        public string FormData => SubmittedFormData;
    }

    public class CompletedTaskDto
    {
        public int TaskId { get; set; }
        public string TaskRole { get; set; }
        public string TaskName { get; set; }
        public string FormData { get; set; }
        public string CompletedByName { get; set; }
        public DateTime CompletedAt { get; set; }
        public string Decision { get; set; }
        public string Comments { get; set; }
        public int RoleAppearanceIndex { get; set; }
    }

    public class MySubmissionDto
    {
        public int Id { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string FormType { get; set; }
        public string SubmitterName { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string FormData { get; set; }
    }

    public class WorkflowInstanceDetailDto
    {
        public int WorkflowInstanceId { get; set; }
        public string FormType { get; set; }
        public string SubmitterName { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string FormData { get; set; }
    }

    public class WorkflowSummaryDto
    {
        public int WorkflowInstanceId { get; set; }
        public string WorkflowName { get; set; }
        public string FormType { get; set; }
        public string InitiatorName { get; set; }
        public string CurrentRole { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
    }

    public class WorkflowHistoryDto
    {
        public int Id { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string Action { get; set; }
        public string PerformedByName { get; set; }
        public string PerformedByRole { get; set; }
        public string FromStatus { get; set; }
        public string ToStatus { get; set; }
        public string FromRole { get; set; }
        public string ToRole { get; set; }
        public string Decision { get; set; }
        public string Comments { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class TaskInfoDto
    {
        public int WorkflowInstanceId { get; set; }
        public int TaskSequence { get; set; }
        public string FormType { get; set; }
        public int InitiatorId { get; set; }
        public int RoleAppearanceIndex { get; set; }
        public string TaskRole { get; set; }
    }
    
    public class WorkflowDebugInfo
    {
        public int WorkflowInstanceId { get; set; }
        public string FormType { get; set; }
        public string CurrentRole { get; set; }
        public string Status { get; set; }
        public string InitiatorName { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TaskDebugInfo> Tasks { get; set; }
        public Dictionary<string, int> RoleAppearanceCounts { get; set; }
    }
    
    public class TaskDebugInfo
    {
        public int Id { get; set; }
        public string TaskId { get; set; }
        public string Role { get; set; }
        public int Sequence { get; set; }
        public string Status { get; set; }
        public string FormType { get; set; }
        public int RoleAppearanceIndex { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    #endregion
}
