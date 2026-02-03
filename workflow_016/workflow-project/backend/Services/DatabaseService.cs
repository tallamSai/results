using System.Data;
using Microsoft.Data.SqlClient;
using WorkflowManagementSystem.Models;
using System.Text.Json;

namespace WorkflowManagementSystem.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public string GetConnectionString()
        {
            return _connectionString;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand("SELECT * FROM Users WHERE Email = @Email", connection);
            command.Parameters.AddWithValue("@Email", email);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new User
                {
                    Id = reader.GetInt32("Id"),
                    Email = reader.GetString("Email"),
                    Password = reader.GetString("Password"),
                    FirstName = reader.GetString("FirstName"),
                    LastName = reader.GetString("LastName"),
                    GenId = reader.GetString("GenId"),
                    ProfilePicture = reader.IsDBNull(reader.GetOrdinal("ProfilePicture")) ? null : reader.GetString("ProfilePicture"),
                    Role = reader.GetString("Role"),
                    CreatedAt = reader.GetDateTime("CreatedAt")
                };
            }

            return null;
        }

        public async Task<int> CreateUser(User user)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                @"INSERT INTO Users (Email, Password, FirstName, LastName, GenId, ProfilePicture, Role, CreatedAt) 
                  OUTPUT INSERTED.Id
                  VALUES (@Email, @Password, @FirstName, @LastName, @GenId, @ProfilePicture, @Role, @CreatedAt)",
                connection
            );

            command.Parameters.AddWithValue("@Email", user.Email);
            command.Parameters.AddWithValue("@Password", user.Password);
            command.Parameters.AddWithValue("@FirstName", user.FirstName);
            command.Parameters.AddWithValue("@LastName", user.LastName);
            command.Parameters.AddWithValue("@GenId", user.GenId);
            command.Parameters.AddWithValue("@ProfilePicture", (object)user.ProfilePicture ?? DBNull.Value);
            command.Parameters.AddWithValue("@Role", user.Role);
            command.Parameters.AddWithValue("@CreatedAt", user.CreatedAt);

            return (int)await command.ExecuteScalarAsync();
        }

        public async Task<int> SaveFormData(string tableName, Dictionary<string, object> data)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var columns = string.Join(", ", data.Keys);
            var parameters = string.Join(", ", data.Keys.Select(k => "@" + k));

            var command = new SqlCommand(
                $@"INSERT INTO {tableName} ({columns}) 
                   OUTPUT INSERTED.Id
                   VALUES ({parameters})",
                connection
            );

            foreach (var kvp in data)
            {
                var value = kvp.Value;
                
                // Convert JsonElement to actual value
                if (value is JsonElement jsonElement)
                {
                    value = jsonElement.ValueKind switch
                    {
                        JsonValueKind.String => jsonElement.GetString(),
                        JsonValueKind.Number => jsonElement.TryGetInt32(out var intVal) ? intVal : jsonElement.GetDouble(),
                        JsonValueKind.True => true,
                        JsonValueKind.False => false,
                        JsonValueKind.Null => DBNull.Value,
                        JsonValueKind.Array => jsonElement.GetRawText(),
                        JsonValueKind.Object => jsonElement.GetRawText(),
                        _ => jsonElement.GetRawText()
                    };
                }
                
                command.Parameters.AddWithValue("@" + kvp.Key, value ?? DBNull.Value);
            }

            return (int)await command.ExecuteScalarAsync();
        }

        public async Task<List<Dictionary<string, object>>> GetFormData(string tableName, int? userId = null)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = $"SELECT * FROM {tableName}";
            if (userId.HasValue)
            {
                query += " WHERE UserId = @UserId";
            }

            var command = new SqlCommand(query, connection);
            if (userId.HasValue)
            {
                command.Parameters.AddWithValue("@UserId", userId.Value);
            }

            var results = new List<Dictionary<string, object>>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.GetValue(i);
                }
                results.Add(row);
            }

            return results;
        }

        public async Task<bool> UpdateFormData(string tableName, int id, Dictionary<string, object> data)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var setClause = string.Join(", ", data.Keys.Select(k => $"{k} = @{k}"));

            var command = new SqlCommand(
                $"UPDATE {tableName} SET {setClause} WHERE Id = @Id",
                connection
            );

            command.Parameters.AddWithValue("@Id", id);
            foreach (var kvp in data)
            {
                command.Parameters.AddWithValue("@" + kvp.Key, kvp.Value ?? DBNull.Value);
            }

            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> DeleteFormData(string tableName, int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand($"DELETE FROM {tableName} WHERE Id = @Id", connection);
            command.Parameters.AddWithValue("@Id", id);

            return await command.ExecuteNonQueryAsync() > 0;
        }

        // Additional methods for form controllers

        public async Task<int> InsertFormData(string tableName, object formData)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Serialize form data to JSON and store in a generic way
            var json = JsonSerializer.Serialize(formData);
            
            var command = new SqlCommand(
                $@"INSERT INTO {tableName} (FormData, SubmittedAt, Status) 
                   OUTPUT INSERTED.Id
                   VALUES (@FormData, @SubmittedAt, @Status)",
                connection
            );

            command.Parameters.AddWithValue("@FormData", json);
            command.Parameters.AddWithValue("@SubmittedAt", DateTime.UtcNow);
            command.Parameters.AddWithValue("@Status", "Submitted");

            return (int)await command.ExecuteScalarAsync();
        }

        public async Task<List<Dictionary<string, object>>> GetUserFormsByRole(string tableName, int userId, string userRole)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Get forms submitted by user or accessible by their role
            var query = $@"SELECT * FROM {tableName} 
                          WHERE UserId = @UserId OR Status IN ('Submitted', 'Pending')
                          ORDER BY SubmittedAt DESC";

            var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            var results = new List<Dictionary<string, object>>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.GetValue(i);
                }
                results.Add(row);
            }

            return results;
        }

        public async Task<Dictionary<string, object>> GetFormById(string tableName, int id)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand($"SELECT * FROM {tableName} WHERE Id = @Id", connection);
            command.Parameters.AddWithValue("@Id", id);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.GetValue(i);
                }
                return row;
            }

            return null;
        }

        public async Task<bool> UpdateFormStatus(string tableName, int id, string status, int? approvedBy = null, string rejectionReason = null)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var command = new SqlCommand(
                $@"UPDATE {tableName} 
                   SET Status = @Status, 
                       ApprovedBy = @ApprovedBy, 
                       ApprovedAt = @ApprovedAt,
                       RejectionReason = @RejectionReason
                   WHERE Id = @Id",
                connection
            );

            command.Parameters.AddWithValue("@Id", id);
            command.Parameters.AddWithValue("@Status", status);
            command.Parameters.AddWithValue("@ApprovedBy", (object)approvedBy ?? DBNull.Value);
            command.Parameters.AddWithValue("@ApprovedAt", status == "Approved" ? DateTime.UtcNow : (object)DBNull.Value);
            command.Parameters.AddWithValue("@RejectionReason", (object)rejectionReason ?? DBNull.Value);

            return await command.ExecuteNonQueryAsync() > 0;
        }
    }
}
