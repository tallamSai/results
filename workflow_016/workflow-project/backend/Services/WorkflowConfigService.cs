using System.Text.Json;

namespace WorkflowManagementSystem.Services
{
    public class WorkflowConfigService
    {
        private readonly string _connectionString;
        private readonly ILogger<WorkflowConfigService> _logger;
        private Dictionary<string, WorkflowConfiguration> _workflowConfigs;

        public WorkflowConfigService(
            IConfiguration configuration,
            ILogger<WorkflowConfigService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
            _workflowConfigs = new Dictionary<string, WorkflowConfiguration>();
            
            LoadDefaultConfiguration();
        }

        public WorkflowConfiguration GetWorkflowConfig(string formType)
        {
            var workflowKey = NormalizeFormType(formType);
            
            if (_workflowConfigs.ContainsKey(workflowKey))
            {
                return _workflowConfigs[workflowKey];
            }
            
            var config = LoadConfigFromDatabase(workflowKey);
            if (config != null)
            {
                _workflowConfigs[workflowKey] = config;
                return config;
            }
            
            _logger.LogWarning($"No workflow configuration found for {{formType}}, using default");
            return GetDefaultWorkflowConfig();
        }

        public string GetNextRole(string formType, string currentRole, int roleAppearanceIndex = 0)
        {
            var config = GetWorkflowConfig(formType);
            if (config == null || config.RoleSequence == null || config.RoleSequence.Count == 0)
            {
                _logger.LogWarning($"No valid workflow config found for form type: {{formType}}");
                return null;
            }
            
            if (config.RoutingRules != null && config.RoutingRules.Count > 0)
            {
                var relevantRules = config.RoutingRules
                    .Where(r => r.CurrentRole == currentRole)
                    .ToList();
                
                if (relevantRules.Any())
                {
                    RoutingRule selectedRule;
                    if (relevantRules.Count > 1 && roleAppearanceIndex < relevantRules.Count)
                    {
                        var sortedRules = relevantRules.OrderBy(r => {
                            var parts = r.TaskId.Split('_');
                            if (parts.Length > 0 && int.TryParse(parts[parts.Length - 1], out int seqNum))
                                return seqNum;
                            return 0;
                        }).ToList();
                        selectedRule = sortedRules[roleAppearanceIndex];
                        _logger.LogInformation("[Routing] Role {{Role}} appearance {{Index}}: Using routing rule {{TaskId}}", currentRole, roleAppearanceIndex, selectedRule.TaskId);
                    }
                    else
                    {
                        selectedRule = relevantRules.OrderByDescending(r => r.TaskId).First();
                    }
                    
                    var lastRoleRule = selectedRule;
                    
                    if (lastRoleRule.NextRoles != null && lastRoleRule.NextRoles.Count > 0)
                    {
                        var nextRole = lastRoleRule.NextRoles.First();
                        
                        if (nextRole == currentRole)
                        {
                            var currentRoleRules = config.RoutingRules
                                .Where(r => r.CurrentRole == currentRole)
                                .OrderBy(r => r.TaskId)
                                .ToList();
                            
                            foreach (var rule in currentRoleRules)
                            {
                                if (rule.NextRoles != null && rule.NextRoles.Count > 0)
                                {
                                    var nextDifferentRole = rule.NextRoles.FirstOrDefault(r => r != currentRole);
                                    if (!string.IsNullOrEmpty(nextDifferentRole))
                                    {
                                        return nextDifferentRole;
                                    }
                                }
                            }
                        }
                        
                        return nextRole != currentRole ? nextRole : null;
                    }
                }
            }
            
            var roleSequence = config.RoleSequence;
            var currentIndex = roleSequence.IndexOf(currentRole);
            if (currentIndex >= 0 && currentIndex < roleSequence.Count - 1)
            {
                return roleSequence[currentIndex + 1];
            }
            
            return null;
        }

        public List<string> GetWorkflowRoles(string formType)
        {
            var config = GetWorkflowConfig(formType);
            return config.RoleSequence;
        }
        
        public int GetRoleAppearanceIndex(int workflowInstanceId, string role, Microsoft.Data.SqlClient.SqlConnection existingConnection = null, Microsoft.Data.SqlClient.SqlTransaction existingTransaction = null)
        {
            try
            {
                var shouldDisposeConnection = existingConnection == null;
                var connection = existingConnection ?? new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
                
                if (shouldDisposeConnection)
                {
                    connection.Open();
                }

                try
                {
                    _logger.LogInformation("[DEBUG] Querying RoleAppearanceIndex for Role={Role}, WorkflowId={WorkflowId}", role, workflowInstanceId);
                    
                    var cmd = new Microsoft.Data.SqlClient.SqlCommand(
                        @"SELECT COUNT(*) FROM WorkflowTasks WITH (NOLOCK)
                          WHERE WorkflowInstanceId = @WorkflowInstanceId 
                          AND TaskRole = @TaskRole
                          AND Status IN ('Completed', 'Approved', 'Denied')",
                        connection, existingTransaction);
                    cmd.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
                    cmd.Parameters.AddWithValue("@TaskRole", role);

                    var count = (int)cmd.ExecuteScalar();
                    
                    var debugCmd = new Microsoft.Data.SqlClient.SqlCommand(
                        @"SELECT TaskRole, Status, RoleAppearanceIndex, TaskSequence FROM WorkflowTasks 
                          WHERE WorkflowInstanceId = @WorkflowInstanceId ORDER BY TaskSequence",
                        connection, existingTransaction);
                    debugCmd.Parameters.AddWithValue("@WorkflowInstanceId", workflowInstanceId);
                    using var reader = debugCmd.ExecuteReader();
                    var allTasks = new System.Text.StringBuilder();
                    while (reader.Read())
                    {
                        allTasks.Append($"[{reader["TaskRole"]}:{reader["Status"]}:Idx={reader["RoleAppearanceIndex"]}:Seq={reader["TaskSequence"]}] ");
                    }
                    _logger.LogInformation("[DEBUG-ALL-TASKS] Workflow {WorkflowId} tasks: {Tasks}", workflowInstanceId, allTasks.ToString());
                    
                    _logger.LogInformation("[RoleAppearance] Role={Role} in workflow={WorkflowId}: Found={Count} completed tasks, returning RoleAppearanceIndex={Index}", role, workflowInstanceId, count, count);
                    
                    
                    return count;
                }
                finally
                {
                    if (shouldDisposeConnection)
                    {
                        connection.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ERROR] Failed to get role appearance index for {Role} in workflow {WorkflowInstanceId}: {ErrorMessage}", role, workflowInstanceId, ex.Message);
                return 0;
            }
        }
        
        public int GetRoleTotalAppearances(string formType, string role)
        {
            try
            {
                var config = GetWorkflowConfig(formType);
                if (config.RoleStepSequence != null && config.RoleStepSequence.ContainsKey(role))
                {
                    return config.RoleStepSequence[role].Count;
                }
                return 1;
            }
            catch
            {
                return 1;
            }
        }

        public bool CanRoleAccessForm(string formType, string role, string action)
        {
            var config = GetWorkflowConfig(formType);
            
            if (action == "submit")
            {
                return config.RoleSequence.FirstOrDefault() == role;
            }
            else if (action == "approve" || action == "deny")
            {
                return config.RoleSequence.Contains(role) && role != config.RoleSequence.FirstOrDefault();
            }
            
            return false;
        }

        public async Task<bool> AddOrUpdateWorkflowConfig(
            string workflowKey, 
            WorkflowConfiguration config)
        {
            try
            {
                _workflowConfigs[workflowKey] = config;
                
                await SaveConfigToDatabase(workflowKey, config);
                
                _logger.LogInformation($"Workflow configuration updated: {{workflowKey}}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to update workflow configuration: {{workflowKey}}");
                return false;
            }
        }

        public async Task<WorkflowConfiguration> LoadFromBpmn(string bpmnFilePath)
        {
            throw new NotImplementedException("Runtime BPMN parsing not yet implemented");
        }

        #region Private Methods

        private void LoadDefaultConfiguration()
        {
            var configJson = @"{
  ""workflows"": {
    ""contract-manager-workflow"": {
      ""name"": ""Contract_Manager Workflow"",
      ""roleSequence"": [
        ""Contract_Manager"",
        ""Legal_Counsel"",
        ""Finance_Director""
      ],
      ""roleStepSequence"": {
        ""Contract_Manager"": [
          2,
          6,
          8
        ],
        ""Legal_Counsel"": [
          3
        ],
        ""Finance_Director"": [
          4
        ]
      },
      ""routingRules"": [
        {
          ""taskId"": ""Task_Drafts_contract_with_vendor_name_contrac_1"",
          ""currentRole"": ""Contract_Manager"",
          ""nextRoles"": [
            ""Legal_Counsel""
          ],
          ""denyRoles"": []
        },
        {
          ""taskId"": ""Task_Reviews_and_suggests_modifications_2"",
          ""currentRole"": ""Legal_Counsel"",
          ""nextRoles"": [
            ""Finance_Director""
          ],
          ""denyRoles"": []
        },
        {
          ""taskId"": ""Task_Confirms_budget_availability_3"",
          ""currentRole"": ""Finance_Director"",
          ""nextRoles"": [
            ""Contract_Manager""
          ],
          ""denyRoles"": []
        },
        {
          ""taskId"": ""Task_Finalizes_and_sends_for_vendor_signature_6"",
          ""currentRole"": ""Contract_Manager"",
          ""nextRoles"": [
            ""Contract_Manager""
          ],
          ""denyRoles"": []
        },
        {
          ""taskId"": ""Task_Archives_and_activates_the_contract_7"",
          ""currentRole"": ""Contract_Manager"",
          ""nextRoles"": [],
          ""denyRoles"": []
        }
      ]
    }
  }
}";
            
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var rootConfig = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, object>>>(configJson, options);
                if (rootConfig != null && rootConfig.ContainsKey("workflows"))
                {
                    var workflowsJson = JsonSerializer.Serialize(rootConfig["workflows"]);
                    var workflows = JsonSerializer.Deserialize<Dictionary<string, WorkflowConfiguration>>(workflowsJson, options);
                    
                    if (workflows != null)
                    {
                        _workflowConfigs = workflows;
                        _logger.LogInformation($"Loaded {{workflows.Count}} default workflow configurations");
                        
                        _ = Task.Run(() => SeedDatabaseAsync());
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load default workflow configurations");
            }
        }

        private async Task SeedDatabaseAsync()
        {
            try
            {
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
                await connection.OpenAsync();

                var checkCmd = new Microsoft.Data.SqlClient.SqlCommand(
                    "SELECT COUNT(*) FROM WorkflowConfigurations", connection);
                var count = (int)await checkCmd.ExecuteScalarAsync();

                if (count > 0)
                {
                    _logger.LogInformation("Workflow configurations already seeded");
                    return;
                }

                foreach (var kvp in _workflowConfigs)
                {
                    var configJson = JsonSerializer.Serialize(kvp.Value);
                    var insertCmd = new Microsoft.Data.SqlClient.SqlCommand(
                        @"INSERT INTO WorkflowConfigurations 
                          (WorkflowKey, WorkflowName, Description, ConfigJson, IsActive, CreatedAt)
                          VALUES (@WorkflowKey, @WorkflowName, @Description, @ConfigJson, 1, GETDATE())",
                        connection);
                    
                    insertCmd.Parameters.AddWithValue("@WorkflowKey", kvp.Key);
                    insertCmd.Parameters.AddWithValue("@WorkflowName", kvp.Value.Name);
                    insertCmd.Parameters.AddWithValue("@Description", $"Auto-generated workflow for {kvp.Value.Name}");
                    insertCmd.Parameters.AddWithValue("@ConfigJson", configJson);
                    
                    await insertCmd.ExecuteNonQueryAsync();
                }

                _logger.LogInformation("Successfully seeded workflow configurations to database");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to seed workflow configurations");
            }
        }

        private WorkflowConfiguration LoadConfigFromDatabase(string workflowKey)
        {
            try
            {
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
                connection.Open();

                var cmd = new Microsoft.Data.SqlClient.SqlCommand(
                    "SELECT ConfigJson FROM WorkflowConfigurations WHERE WorkflowKey = @WorkflowKey AND IsActive = 1",
                    connection);
                cmd.Parameters.AddWithValue("@WorkflowKey", workflowKey);

                var configJson = cmd.ExecuteScalar() as string;
                if (!string.IsNullOrEmpty(configJson))
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    return JsonSerializer.Deserialize<WorkflowConfiguration>(configJson, options);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to load workflow config from database: {workflowKey}");
            }

            return null;
        }

        private async Task SaveConfigToDatabase(string workflowKey, WorkflowConfiguration config)
        {
            try
            {
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
                await connection.OpenAsync();

                var configJson = JsonSerializer.Serialize(config);

                var checkCmd = new Microsoft.Data.SqlClient.SqlCommand(
                    "SELECT COUNT(*) FROM WorkflowConfigurations WHERE WorkflowKey = @WorkflowKey",
                    connection);
                checkCmd.Parameters.AddWithValue("@WorkflowKey", workflowKey);
                var exists = (int)await checkCmd.ExecuteScalarAsync() > 0;

                if (exists)
                {
                    var updateCmd = new Microsoft.Data.SqlClient.SqlCommand(
                        @"UPDATE WorkflowConfigurations 
                          SET ConfigJson = @ConfigJson, UpdatedAt = GETDATE()
                          WHERE WorkflowKey = @WorkflowKey",
                        connection);
                    updateCmd.Parameters.AddWithValue("@WorkflowKey", workflowKey);
                    updateCmd.Parameters.AddWithValue("@ConfigJson", configJson);
                    await updateCmd.ExecuteNonQueryAsync();
                }
                else
                {
                    var insertCmd = new Microsoft.Data.SqlClient.SqlCommand(
                        @"INSERT INTO WorkflowConfigurations 
                          (WorkflowKey, WorkflowName, Description, ConfigJson, IsActive, CreatedAt)
                          VALUES (@WorkflowKey, @WorkflowName, @Description, @ConfigJson, 1, GETDATE())",
                        connection);
                    insertCmd.Parameters.AddWithValue("@WorkflowKey", workflowKey);
                    insertCmd.Parameters.AddWithValue("@WorkflowName", config.Name);
                    insertCmd.Parameters.AddWithValue("@Description", $"Workflow for {config.Name}");
                    insertCmd.Parameters.AddWithValue("@ConfigJson", configJson);
                    await insertCmd.ExecuteNonQueryAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to save workflow config to database: {workflowKey}");
            }
        }

        private WorkflowConfiguration GetDefaultWorkflowConfig()
        {
            throw new InvalidOperationException("No workflow configuration found. Please ensure BPMN analysis completed successfully and generated valid workflow configurations.");
        }

        private string NormalizeFormType(string formType)
        {
            var normalizedForm = formType
                .ToLower()
                .Replace(" ", "-")
                .Replace("_", "-")
                .Replace("/", "-");
            
            if (_workflowConfigs.ContainsKey(normalizedForm))
            {
                return normalizedForm;
            }
            
            if (_workflowConfigs.Any())
            {
                return _workflowConfigs.Keys.First();
            }
            
            throw new InvalidOperationException($"No workflow configuration found for form type: {formType}");
        }

        #endregion
    }

    #region Configuration Models

    public class WorkflowConfiguration
    {
        public string Name { get; set; }
        public List<string> RoleSequence { get; set; }
        public Dictionary<string, List<int>> RoleStepSequence { get; set; }
        public List<RoutingRule> RoutingRules { get; set; }
    }

    public class RoutingRule
    {
        public string TaskId { get; set; }
        public string CurrentRole { get; set; }
        public List<string> NextRoles { get; set; }
        public List<string> DenyRoles { get; set; }
    }

    #endregion
}
