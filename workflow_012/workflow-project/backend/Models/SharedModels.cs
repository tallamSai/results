namespace WorkflowManagementSystem.Models
{
    public class RejectRequest
    {
        public string Reason { get; set; } = "";
    }

    public interface IFormData
    {
        int Id { get; set; }
        int UserId { get; set; }
        string Status { get; set; }
        DateTime SubmittedAt { get; set; }
        DateTime? ApprovedAt { get; set; }
        int? ApprovedBy { get; set; }
        string? RejectionReason { get; set; }
    }
}
