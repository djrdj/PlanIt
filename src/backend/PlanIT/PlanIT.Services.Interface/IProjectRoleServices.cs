using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IProjectRoleServices
    {
        Task<List<ProjectRole>> GetAllProjectRolesAsync();
        Task<ProjectRole> GetProjectRoleByID(int ProjectRoleID);
        Task AddProjectRoleAsync(ProjectRole projectRole);
        Task DeleteProjectRoleAsync(int ProjectRoleID);
        Task UpdateProjectRoleAsync(ProjectRole projectRole, int ProjectRoleID);
    }
}
