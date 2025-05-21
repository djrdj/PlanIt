using PlanIT.DataTransferModel.Project;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class ProjectMapper
    {
        public static GetProjectDTO ToDto(this Project project) => new()
        {
            ProjectID = project.ProjectID,
            ProjectName = project.ProjectName,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            Status = project.Status,
            ProjectLeaderID=project.ProjectLeaderID
        };

        public static Project FromDto(this CreateProjectDTO dto) => new()
        {
            ProjectName = dto.ProjectName,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = (DateTime)dto.EndDate,
            ProjectLeaderID = (int)dto.ProjectLeaderID
        };
        public static Project FromDto(this UpdateProjectDTO dto) => new()
        {
            ProjectName = dto.ProjectName,
            Description = dto.Description,
            EndDate = (DateTime)dto.EndDate
        };
    }
}