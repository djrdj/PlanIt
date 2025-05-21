using PlanIT.DataTransferModel.User_Project;
using PlanIT.DataTransferModel.UserAssignment;
using PlanIT.Models;

namespace PlanIT.Mappers
{
    public static class UserAssignmentMapper
    {
        public static GetUserAssignmentDTO ToDto(this User_Assignment user_Assignment) => new()
        {
            UserID = user_Assignment.UserID,
            AssignmentID = user_Assignment.AssignmentID,
            Type = user_Assignment.Type
        };
    }
}
