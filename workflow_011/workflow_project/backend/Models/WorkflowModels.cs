namespace WorkflowManagementSystem.Models
{
    // Workflow DTOs
    public class WorkflowTaskDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string TaskRole { get; set; }
        public string TaskStatus { get; set; }
        public DateTime TaskCreatedAt { get; set; }
        public int WorkflowInstanceId { get; set; }
        public string WorkflowName { get; set; }
        public string FormType { get; set; }
        public int InitiatedBy { get; set; }
        public string WorkflowStatus { get; set; }
        public DateTime WorkflowCreatedAt { get; set; }
        public string InitiatorName { get; set; }
    }

    public class WorkflowInstanceDto
    {
        public int Id { get; set; }
        public string WorkflowName { get; set; }
        public string FormType { get; set; }
        public int InitiatedBy { get; set; }
        public string InitiatorName { get; set; }
        public string CurrentTaskName { get; set; }
        public string CurrentRole { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<WorkflowTaskDetailDto> Tasks { get; set; }
        public List<WorkflowFileDto> Files { get; set; }
    }

    public class WorkflowTaskDetailDto
    {
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string TaskRole { get; set; }
        public string Status { get; set; }
        public string FormData { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string CompletedByName { get; set; }
    }

    public class WorkflowFileDto
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string OriginalFileName { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; }
        public string UploadedByName { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    // Notification DTOs
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public string RelatedFormType { get; set; }
        public int? RelatedFormId { get; set; }
        public int? RelatedWorkflowInstanceId { get; set; }
        public int? FromUserId { get; set; }
        public string FromUserName { get; set; }
        public string FromUserRole { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FormRoleMappingDto
    {
        public int MappingId { get; set; }
        public string FormType { get; set; }
        public string AllowedRole { get; set; }
        public string TargetRoles { get; set; }
    }

    // Request models
    public class InitiateWorkflowRequest
    {
        public string WorkflowName { get; set; }
        public string FormType { get; set; }
        public Dictionary<string, object> FormData { get; set; }
    }

    public class CompleteTaskRequest
    {
        public Dictionary<string, object> TaskData { get; set; }
        public string Comments { get; set; }
    }
}
