using Microsoft.Data.SqlClient;
using WorkflowManagementSystem.Models;
using System.Text.Json;

namespace WorkflowManagementSystem.Services
{
    public class WorkflowService
    {
        private readonly string _connectionString;
        private readonly NotificationService _notificationService;

        public WorkflowService(IConfiguration configuration, NotificationService notificationService)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _notificationService = notificationService;
        }

        public async Task<int> InitiateWorkflow(int userId, string userRole, string workflowName, string formType, Dictionary<string, object> formData)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var instanceCmd = new SqlCommand(
                @"INSERT INTO WorkflowInstances (WorkflowName, FormType, InitiatedBy, Status, CreatedAt)
                  OUTPUT INSERTED.Id
                  VALUES (@WorkflowName, @FormType, @InitiatedBy, @Status, @CreatedAt)",
                connection
            );

            instanceCmd.Parameters.AddWithValue("@WorkflowName", workflowName);
            instanceCmd.Parameters.AddWithValue("@FormType", formType);
            instanceCmd.Parameters.AddWithValue("@InitiatedBy", userId);
            instanceCmd.Parameters.AddWithValue("@Status", "Active");
            instanceCmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            var workflowInstanceId = (int)await instanceCmd.ExecuteScalarAsync();

            await CreateTask(connection, workflowInstanceId, "Initial Submission", userRole, formData);

            await LogHistory(connection, workflowInstanceId, null, "Workflow Initiated", userId, null, "Active", null);

            return workflowInstanceId;
        }

        public async Task<List<WorkflowTaskDto>> GetMyTasks(int userId, string userRole)
        {
            var tasks = new List<WorkflowTaskDto>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT 
                    t.Id as TaskId,
                    t.TaskName,
                    t.TaskRole,
                    t.Status as TaskStatus,
                    t.CreatedAt as TaskCreatedAt,
                    w.Id as WorkflowInstanceId,
                    w.WorkflowName,
                    w.FormType,
                    w.InitiatedBy,
                    w.Status as WorkflowStatus,
                    w.CreatedAt as WorkflowCreatedAt,
                    u.FirstName + ' ' + u.LastName as InitiatorName
                FROM WorkflowTasks t
                INNER JOIN WorkflowInstances w ON t.WorkflowInstanceId = w.Id
                INNER JOIN Users u ON w.InitiatedBy = u.Id
                WHERE t.TaskRole = @UserRole AND t.Status = 'Pending'
                ORDER BY t.CreatedAt DESC";

            var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserRole", userRole);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                tasks.Add(new WorkflowTaskDto
                {
                    TaskId = reader.GetInt32(reader.GetOrdinal("TaskId")),
                    TaskName = reader.GetString(reader.GetOrdinal("TaskName")),
                    TaskRole = reader.GetString(reader.GetOrdinal("TaskRole")),
                    TaskStatus = reader.GetString(reader.GetOrdinal("TaskStatus")),
                    TaskCreatedAt = reader.GetDateTime(reader.GetOrdinal("TaskCreatedAt")),
                    WorkflowInstanceId = reader.GetInt32(reader.GetOrdinal("WorkflowInstanceId")),
                    WorkflowName = reader.GetString(reader.GetOrdinal("WorkflowName")),
                    FormType = reader.GetString(reader.GetOrdinal("FormType")),
                    InitiatedBy = reader.GetInt32(reader.GetOrdinal("InitiatedBy")),
                    WorkflowStatus = reader.GetString(reader.GetOrdinal("WorkflowStatus")),
                    WorkflowCreatedAt = reader.GetDateTime(reader.GetOrdinal("WorkflowCreatedAt")),
                    InitiatorName = reader.GetString(reader.GetOrdinal("InitiatorName"))
                });
            }

            return tasks;
        }

        public async Task<bool> CompleteTask(int taskId, int userId, Dictionary<string, object> taskData, string comments)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var updateCmd = new SqlCommand(
                @"UPDATE WorkflowTasks 
                  SET Status = 'Completed', 
                      CompletedBy = @CompletedBy, 
                      CompletedAt = @CompletedAt,
                      FormData = @FormData,
                      Comments = @Comments
                  WHERE Id = @TaskId",
                connection
            );

            updateCmd.Parameters.AddWithValue("@TaskId", taskId);
            updateCmd.Parameters.AddWithValue("@CompletedBy", userId);
            updateCmd.Parameters.AddWithValue("@CompletedAt", DateTime.UtcNow);
            updateCmd.Parameters.AddWithValue("@FormData", JsonSerializer.Serialize(taskData));
            updateCmd.Parameters.AddWithValue("@Comments", comments ?? string.Empty);

            var rowsAffected = await updateCmd.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                var selectCmd = new SqlCommand(
                    "SELECT WorkflowInstanceId FROM WorkflowTasks WHERE Id = @TaskId",
                    connection
                );
                selectCmd.Parameters.AddWithValue("@TaskId", taskId);
                var workflowInstanceId = (int)await selectCmd.ExecuteScalarAsync();

                await LogHistory(connection, workflowInstanceId, taskId, "Task Completed", userId, null, null, comments);

                var checkCmd = new SqlCommand(
                    "SELECT COUNT(*) FROM WorkflowTasks WHERE WorkflowInstanceId = @WorkflowInstanceId AND Status = 'Pending'",
                    connection
                );
                checkCmd.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
                var pendingCount = (int)await checkCmd.ExecuteScalarAsync();

                if (pendingCount == 0)
                {
                    var completeCmd = new SqlCommand(
                        "UPDATE WorkflowInstances SET Status = 'Completed', CompletedAt = @CompletedAt WHERE Id = @WorkflowInstanceId",
                        connection
                    );
                    completeCmd.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
                    completeCmd.Parameters.AddWithValue("@CompletedAt", DateTime.UtcNow);
                    await completeCmd.ExecuteNonQueryAsync();

                    await LogHistory(connection, workflowInstanceId, null, "Workflow Completed", userId, "Active", "Completed", null);
                }

                return true;
            }

            return false;
        }

        public async Task<WorkflowInstanceDto> GetWorkflowInstance(int workflowInstanceId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var instanceCmd = new SqlCommand(
                @"SELECT w.*, u.FirstName + ' ' + u.LastName as InitiatorName
                  FROM WorkflowInstances w
                  INNER JOIN Users u ON w.InitiatedBy = u.Id
                  WHERE w.Id = @WorkflowInstanceId",
                connection
            );
            instanceCmd.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);

            WorkflowInstanceDto instance = null;

            using var reader = await instanceCmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                instance = new WorkflowInstanceDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    WorkflowName = reader.GetString(reader.GetOrdinal("WorkflowName")),
                    FormType = reader.GetString(reader.GetOrdinal("FormType")),
                    InitiatedBy = reader.GetInt32(reader.GetOrdinal("InitiatedBy")),
                    InitiatorName = reader.GetString(reader.GetOrdinal("InitiatorName")),
                    CurrentTaskName = reader.IsDBNull(reader.GetOrdinal("CurrentTaskName")) ? null : reader.GetString(reader.GetOrdinal("CurrentTaskName")),
                    CurrentRole = reader.IsDBNull(reader.GetOrdinal("CurrentRole")) ? null : reader.GetString(reader.GetOrdinal("CurrentRole")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    CompletedAt = reader.IsDBNull(reader.GetOrdinal("CompletedAt")) ? null : (DateTime?)reader.GetDateTime(reader.GetOrdinal("CompletedAt"))
                };
            }

            if (instance == null) return null;

            instance.Tasks = await GetWorkflowTasks(connection, workflowInstanceId);

            instance.Files = await GetWorkflowFiles(connection, workflowInstanceId);

            return instance;
        }

        private async Task CreateTask(SqlConnection connection, int workflowInstanceId, string taskName, string taskRole, Dictionary<string, object> formData)
        {
            var command = new SqlCommand(
                @"INSERT INTO WorkflowTasks (WorkflowInstanceId, TaskId, TaskName, TaskRole, Status, FormData, CreatedAt)
                  VALUES (@WorkflowInstanceId, @TaskId, @TaskName, @TaskRole, @Status, @FormData, @CreatedAt)",
                connection
            );

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@TaskId", Guid.NewGuid().ToString());
            command.Parameters.AddWithValue("@TaskName", taskName);
            command.Parameters.AddWithValue("@TaskRole", taskRole);
            command.Parameters.AddWithValue("@Status", "Pending");
            command.Parameters.AddWithValue("@FormData", JsonSerializer.Serialize(formData));
            command.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        private async Task LogHistory(SqlConnection connection, int workflowInstanceId, int? taskId, string action, int performedBy, string fromStatus, string toStatus, string comments)
        {
            var command = new SqlCommand(
                @"INSERT INTO WorkflowHistory (WorkflowInstanceId, TaskId, Action, PerformedBy, FromStatus, ToStatus, Comments, Timestamp)
                  VALUES (@WorkflowInstanceId, @TaskId, @Action, @PerformedBy, @FromStatus, @ToStatus, @Comments, @Timestamp)",
                connection
            );

            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
            command.Parameters.AddWithValue("@TaskId", (object)taskId ?? DBNull.Value);
            command.Parameters.AddWithValue("@Action", action);
            command.Parameters.AddWithValue("@PerformedBy", performedBy);
            command.Parameters.AddWithValue("@FromStatus", (object)fromStatus ?? DBNull.Value);
            command.Parameters.AddWithValue("@ToStatus", (object)toStatus ?? DBNull.Value);
            command.Parameters.AddWithValue("@Comments", (object)comments ?? DBNull.Value);
            command.Parameters.AddWithValue("@Timestamp", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        private async Task<List<WorkflowTaskDetailDto>> GetWorkflowTasks(SqlConnection connection, int workflowInstanceId)
        {
            var tasks = new List<WorkflowTaskDetailDto>();

            var command = new SqlCommand(
                @"SELECT t.*, u.FirstName + ' ' + u.LastName as CompletedByName
                  FROM WorkflowTasks t
                  LEFT JOIN Users u ON t.CompletedBy = u.Id
                  WHERE t.WorkflowInstanceId = @WorkflowInstanceId
                  ORDER BY t.CreatedAt",
                connection
            );
            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                tasks.Add(new WorkflowTaskDetailDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    TaskName = reader.GetString(reader.GetOrdinal("TaskName")),
                    TaskRole = reader.GetString(reader.GetOrdinal("TaskRole")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    FormData = reader.IsDBNull(reader.GetOrdinal("FormData")) ? null : reader.GetString(reader.GetOrdinal("FormData")),
                    Comments = reader.IsDBNull(reader.GetOrdinal("Comments")) ? null : reader.GetString(reader.GetOrdinal("Comments")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    CompletedAt = reader.IsDBNull(reader.GetOrdinal("CompletedAt")) ? null : (DateTime?)reader.GetDateTime(reader.GetOrdinal("CompletedAt")),
                    CompletedByName = reader.IsDBNull(reader.GetOrdinal("CompletedByName")) ? null : reader.GetString(reader.GetOrdinal("CompletedByName"))
                });
            }

            return tasks;
        }

        private async Task<List<WorkflowFileDto>> GetWorkflowFiles(SqlConnection connection, int workflowInstanceId)
        {
            var files = new List<WorkflowFileDto>();

            var command = new SqlCommand(
                @"SELECT f.*, u.FirstName + ' ' + u.LastName as UploadedByName
                  FROM WorkflowFiles f
                  INNER JOIN Users u ON f.UploadedBy = u.Id
                  WHERE f.WorkflowInstanceId = @WorkflowInstanceId
                  ORDER BY f.UploadedAt",
                connection
            );
            command.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                files.Add(new WorkflowFileDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    FileName = reader.GetString(reader.GetOrdinal("FileName")),
                    OriginalFileName = reader.GetString(reader.GetOrdinal("OriginalFileName")),
                    FileSize = reader.GetInt64(reader.GetOrdinal("FileSize")),
                    ContentType = reader.IsDBNull(reader.GetOrdinal("ContentType")) ? null : reader.GetString(reader.GetOrdinal("ContentType")),
                    UploadedByName = reader.GetString(reader.GetOrdinal("UploadedByName")),
                    UploadedAt = reader.GetDateTime(reader.GetOrdinal("UploadedAt"))
                });
            }

            return files;
        }
    }
}
