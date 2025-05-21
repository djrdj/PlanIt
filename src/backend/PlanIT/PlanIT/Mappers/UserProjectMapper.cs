using PlanIT.DataTransferModel.User_Project;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class UserProjectMapper
    {
        public static GetUserProjectDTO ToDto(this User_Project userProject) => new()
        {
            UserID = userProject.UserID,
            ProjectID = userProject.ProjectID,
        };

        public static User_Project FromDto(this CreateUserProjectDTO dto) => new()
        {
            UserID = dto.UserID,
            ProjectID = dto.ProjectID,
        };
    }
}
