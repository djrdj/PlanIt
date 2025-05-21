using PlanIT.DataTransferModel.AssignmentList;
using PlanIT.DataTransferModel.Project;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class AssignmentListMapper
    {

        public static GetAssignmentListDTO ToDto(this AssignmentList assignmentList) => new()
        {
            AssignmentListID = assignmentList.AssignmentListID,
            AssignmentListName = assignmentList.AssignmentListName,
            Description = assignmentList.Description,
            ProjectID = assignmentList.ProjectID
        };

        public static AssignmentList FromDto(this CreateAssignmentListDTO dto) => new()
        {
            AssignmentListName = dto.AssignmentListName,
            Description = dto.Description,
            ProjectID = (int)dto.ProjectID
        };
        public static AssignmentList FromDto(this UpdateAssignmentListDTO dto) => new()
        {
            AssignmentListName = dto.AssignmentListName,
            Description = dto.Description,
        };

    }
}
