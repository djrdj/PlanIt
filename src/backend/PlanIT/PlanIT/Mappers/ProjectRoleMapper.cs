using PlanIT.DataTransferModel.ProjectRole;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class ProjectRoleMapper
    {
        public static GetProjectRoleDTO ToDto(this ProjectRole projectRole) => new()
        {
            ProjectRoleID = projectRole.ProjectRoleID,
            ProjectRoleName = projectRole.ProjectRoleName
        };

        public static ProjectRole FromDto(this CreateProjectRoleDTO dto) => new()
        {
            ProjectRoleName = dto.ProjectRoleName
        };
        public static ProjectRole FromDto(this UpdateProjectRoleDTO dto) => new()
        {
            ProjectRoleName = dto.ProjectRoleName
        };
    }
}
