using PlanIT.DataTransferModel.Assignment;
using PlanIT.DataTransferModel.Project;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class AssignmentMapper
    {
        public static GetAssignmentDTO ToDto(this Assignment assignment) => new()
        {
            AssignmentID = assignment.AssignmentID,
            AssignmentName = assignment.AssignmentName,
            AssignmentLeadID = assignment.AssignmentLeadID,
            AssignmentLeadFirstName = assignment.AssignmentLeader?.FirstName,
            AssignmentLeadLastName = assignment.AssignmentLeader?.LastName,
            AssignmentLeadURL = assignment.AssignmentLeader?.PictureURL,
            Description = assignment.Description,
            CreationDate = assignment.CreationDate,
            Status = assignment.Status,
            Priority = assignment.Priority, 
            Deadline = assignment.Deadline,
            CompletionTime = assignment.CompletionTime,
            ParentAssignmentID = assignment.ParentAssignmentID,
            AssignmentListID = assignment.AssignmentListID ,
            AssignmentListName = assignment.AssignmentList?.AssignmentListName,
            Progress = assignment.Progress,
            ProjectID = assignment.AssignmentList != null ? assignment.AssignmentList.ProjectID : null
        };

        public static Assignment FromDto(this CreateAssignmentDTO dto) => new()
        {
            AssignmentName = dto.AssignmentName,
            Description = dto.Description,
            AssignmentLeadID = dto.AssignmentLeadID,
            CreationDate = dto.CreationDate,
            Status = dto.Status,
            Priority = dto.Priority,
            Deadline = (DateTime)dto.Deadline,
            Progress = 0,
            ParentAssignmentID = (int)dto.ParentAssignmentID,
            AssignmentListID = (int)dto.AssignmentListID
        };
        public static Assignment FromDto(this UpdateAssignmentDTO dto) => new()
        {
            AssignmentName = dto.AssignmentName,
            Description = dto.Description,
            AssignmentLeadID = dto.AssignmentLeadID ?? 0, 
            Status = dto.Status,
            Priority = dto.Priority,
            Deadline = dto.Deadline ?? DateTime.MinValue,
            CreationDate = dto.CreationDate ?? DateTime.MinValue,
            ParentAssignmentID = dto.ParentAssignmentID ?? 0,
            AssignmentListID = dto.AssignmentListID ?? 0 ,
            Progress = dto.Progress 

        };
    }
}
