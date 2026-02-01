using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.SignalR;
using WorkflowManagementSystem.Models;
using WorkflowManagementSystem.Hubs;

namespace WorkflowManagementSystem.Services
{
    public class NotificationService
    {
        private readonly string _connectionString;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IConfiguration configuration, IHubContext<NotificationHub> hubContext)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _hubContext = hubContext;
        }

        public async Task<List<NotificationDto>> GetUserNotifications(int userId, bool unreadOnly = false)
        {
            var notifications = new List<NotificationDto>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT * FROM Notifications 
                WHERE UserId = @UserId";
            
            if (unreadOnly)
            {
                query += " AND IsRead = 0";
            }
            
            query += " ORDER BY CreatedAt DESC";

            var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                notifications.Add(new NotificationDto
                {
                    NotificationId = reader.GetInt32(reader.GetOrdinal("NotificationId")),
                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                    Title = reader.GetString(reader.GetOrdinal("Title")),
                    Message = reader.GetString(reader.GetOrdinal("Message")),
                    Type = reader.GetString(reader.GetOrdinal("Type")),
                    RelatedFormType = reader.IsDBNull(reader.GetOrdinal("RelatedFormType")) ? null : reader.GetString(reader.GetOrdinal("RelatedFormType")),
                    RelatedFormId = reader.IsDBNull(reader.GetOrdinal("RelatedFormId")) ? null : reader.GetInt32(reader.GetOrdinal("RelatedFormId")),
                    RelatedWorkflowInstanceId = reader.IsDBNull(reader.GetOrdinal("RelatedWorkflowInstanceId")) ? null : reader.GetInt32(reader.GetOrdinal("RelatedWorkflowInstanceId")),
                    FromUserId = reader.IsDBNull(reader.GetOrdinal("FromUserId")) ? null : reader.GetInt32(reader.GetOrdinal("FromUserId")),
                    FromUserName = reader.IsDBNull(reader.GetOrdinal("FromUserName")) ? null : reader.GetString(reader.GetOrdinal("FromUserName")),
                    FromUserRole = reader.IsDBNull(reader.GetOrdinal("FromUserRole")) ? null : reader.GetString(reader.GetOrdinal("FromUserRole")),
                    IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                });
            }

            return notifications;
        }

        public async Task<bool> MarkNotificationAsRead(int notificationId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                "UPDATE Notifications SET IsRead = 1 WHERE NotificationId = @NotificationId",
                connection
            );
            command.Parameters.AddWithValue("@NotificationId", notificationId);

            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> MarkAllAsRead(int userId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                "UPDATE Notifications SET IsRead = 1 WHERE UserId = @UserId",
                connection
            );
            command.Parameters.AddWithValue("@UserId", userId);

            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<int> CreateNotification(
            int userId,
            string title,
            string message,
            string type,
            string relatedFormType = null,
            int? relatedFormId = null,
            int? relatedWorkflowInstanceId = null,
            int? fromUserId = null,
            string fromUserName = null,
            string fromUserRole = null)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                @"INSERT INTO Notifications 
                    (UserId, Title, Message, Type, RelatedFormType, RelatedFormId, RelatedWorkflowInstanceId, 
                     FromUserId, FromUserName, FromUserRole, IsRead, CreatedAt)
                  VALUES 
                    (@UserId, @Title, @Message, @Type, @RelatedFormType, @RelatedFormId, @RelatedWorkflowInstanceId, 
                     @FromUserId, @FromUserName, @FromUserRole, 0, GETDATE());
                  SELECT SCOPE_IDENTITY();",
                connection);

            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@Title", title);
            command.Parameters.AddWithValue("@Message", message);
            command.Parameters.AddWithValue("@Type", type);
            command.Parameters.AddWithValue("@RelatedFormType", (object)relatedFormType ?? DBNull.Value);
            command.Parameters.AddWithValue("@RelatedFormId", (object)relatedFormId ?? DBNull.Value);
            command.Parameters.AddWithValue("@RelatedWorkflowInstanceId", (object)relatedWorkflowInstanceId ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromUserId", (object)fromUserId ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromUserName", (object)fromUserName ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromUserRole", (object)fromUserRole ?? DBNull.Value);

            var result = await command.ExecuteScalarAsync();
            var notificationId = Convert.ToInt32(result);

            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                notificationId = notificationId,
                title = title,
                message = message,
                type = type,
                createdAt = DateTime.Now
            });

            return notificationId;
        }

        public async Task NotifyFormSubmission(int formId, string formType, int submitterId, string submitterName, string submitterRole, List<string> targetRoles)
        {
            Console.WriteLine($"[NOTIFICATION] Form submission: {formType} by {submitterName} ({submitterRole})");
            Console.WriteLine($"[NOTIFICATION] Target roles: {string.Join(", ", targetRoles)}");

            var targetUsers = await GetUsersByRoles(targetRoles);
            Console.WriteLine($"[NOTIFICATION] Found {targetUsers.Count} target users");

            foreach (var user in targetUsers)
            {
                if (user.Id == submitterId) continue;

                var notificationId = await CreateNotification(new NotificationDto
                {
                    UserId = user.Id,
                    Title = "New Form Submission",
                    Message = $"{submitterName} ({submitterRole}) has submitted a {formType}. Please review.",
                    Type = "form_submission",
                    RelatedFormType = formType,
                    RelatedFormId = formId,
                    FromUserId = submitterId,
                    FromUserName = submitterName,
                    FromUserRole = submitterRole,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });

                await _hubContext.Clients.User(user.Id.ToString()).SendAsync("ReceiveNotification", new
                {
                    notificationId = notificationId,
                    title = "New Form Submission",
                    message = $"{submitterName} ({submitterRole}) has submitted a {formType}. Please review.",
                    type = "form_submission",
                    relatedFormType = formType,
                    relatedFormId = formId,
                    fromUserId = submitterId,
                    fromUserName = submitterName,
                    fromUserRole = submitterRole
                });
            }
        }

        public async Task NotifyFormStatusUpdate(int formId, string formType, int submitterId, string submitterName, int responderId, string responderName, string responderRole, string status, string comments)
        {
            Console.WriteLine($"[NOTIFICATION] Form status update: {formType} - {status} by {responderName} ({responderRole})");

            var notificationId = await CreateNotification(new NotificationDto
            {
                UserId = submitterId,
                Title = $"Form {status}",
                Message = $"{responderName} ({responderRole}) has {status.ToLower()} your {formType}. {comments}",
                Type = "form_response",
                RelatedFormType = formType,
                RelatedFormId = formId,
                FromUserId = responderId,
                FromUserName = responderName,
                FromUserRole = responderRole,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _hubContext.Clients.User(submitterId.ToString()).SendAsync("ReceiveNotification", new
            {
                notificationId = notificationId,
                title = $"Form {status}",
                message = $"{responderName} ({responderRole}) has {status.ToLower()} your {formType}. {comments}",
                type = "form_response",
                relatedFormType = formType,
                relatedFormId = formId,
                fromUserId = responderId,
                fromUserName = responderName,
                fromUserRole = responderRole
            });
        }

        private async Task<int> CreateNotification(NotificationDto notification)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                @"INSERT INTO Notifications (UserId, Title, Message, Type, RelatedFormType, RelatedFormId, 
                  RelatedWorkflowInstanceId, FromUserId, FromUserName, FromUserRole, IsRead, CreatedAt)
                  OUTPUT INSERTED.NotificationId
                  VALUES (@UserId, @Title, @Message, @Type, @RelatedFormType, @RelatedFormId, 
                  @RelatedWorkflowInstanceId, @FromUserId, @FromUserName, @FromUserRole, @IsRead, @CreatedAt)",
                connection
            );

            command.Parameters.AddWithValue("@UserId", notification.UserId);
            command.Parameters.AddWithValue("@Title", notification.Title);
            command.Parameters.AddWithValue("@Message", notification.Message);
            command.Parameters.AddWithValue("@Type", notification.Type);
            command.Parameters.AddWithValue("@RelatedFormType", (object)notification.RelatedFormType ?? DBNull.Value);
            command.Parameters.AddWithValue("@RelatedFormId", (object)notification.RelatedFormId ?? DBNull.Value);
            command.Parameters.AddWithValue("@RelatedWorkflowInstanceId", (object)notification.RelatedWorkflowInstanceId ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromUserId", (object)notification.FromUserId ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromUserName", (object)notification.FromUserName ?? DBNull.Value);
            command.Parameters.AddWithValue("@FromUserRole", (object)notification.FromUserRole ?? DBNull.Value);
            command.Parameters.AddWithValue("@IsRead", notification.IsRead);
            command.Parameters.AddWithValue("@CreatedAt", notification.CreatedAt);

            return (int)await command.ExecuteScalarAsync();
        }

        private async Task<List<User>> GetUsersByRoles(List<string> roles)
        {
            var users = new List<User>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var roleParams = string.Join(",", roles.Select((_, i) => $"@Role{i}"));
            var query = $"SELECT Id, Email, FirstName, LastName, Role, CreatedAt FROM Users WHERE Role IN ({roleParams})";

            var command = new SqlCommand(query, connection);
            for (int i = 0; i < roles.Count; i++)
            {
                command.Parameters.AddWithValue($"@Role{i}", roles[i]);
            }

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                users.Add(new User
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                    LastName = reader.GetString(reader.GetOrdinal("LastName")),
                    Role = reader.GetString(reader.GetOrdinal("Role")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                });
            }

            return users;
        }

        public async Task<List<string>> GetFormsByRole(string role)
        {
            var forms = new List<string>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                "SELECT DISTINCT FormType FROM FormRoleMapping WHERE AllowedRole = @Role",
                connection
            );
            command.Parameters.AddWithValue("@Role", role);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                forms.Add(reader.GetString(0));
            }

            return forms;
        }

        public async Task<List<string>> GetTargetRolesForForm(string formType)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                "SELECT TOP 1 TargetRoles FROM FormRoleMapping WHERE FormType = @FormType",
                connection
            );
            command.Parameters.AddWithValue("@FormType", formType);

            var targetRolesStr = await command.ExecuteScalarAsync() as string;
            
            if (string.IsNullOrEmpty(targetRolesStr))
            {
                return new List<string>();
            }

            return targetRolesStr.Split(',').Select(r => r.Trim()).ToList();
        }

        public async Task SendFormNotifications(int formId, string formType, string submitterRole, string[] targetRoles, string message)
        {
            var targetUsers = await GetUsersByRoles(targetRoles.ToList());
            
            foreach (var user in targetUsers)
            {
                var notification = new NotificationDto
                {
                    UserId = user.Id,
                    Title = "New Form Submission",
                    Message = message,
                    Type = "FormSubmitted",
                    RelatedFormType = formType,
                    RelatedFormId = formId,
                    FromUserRole = submitterRole,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await CreateNotification(notification);
            }
        }
    }
}
