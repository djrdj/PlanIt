using PlanIT.Services.Interface;
using PlanIT.Models;
using PlanIT.Logging;
using PlanIT.DataAccessLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace PlanIT.Services.Logic
{
    public class ProjectRoleServices : IProjectRoleServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public ProjectRoleServices(ApplicationDbContext context, ILoggger loger) {
            Logger = loger;
            Context = context;
        }

        public async Task<List<ProjectRole>> GetAllProjectRolesAsync() {
            Logger.LogInformation($"Called: {nameof(GetAllProjectRolesAsync)} from ProjectRoleServices");
            try {
                return await Context.ProjectRoles.ToListAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAllProjectRolesAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<ProjectRole> GetProjectRoleByID(int ProjectRoleID) {
            Logger.LogInformation($"Called: {nameof(GetProjectRoleByID)} with ProjectRoleID: {ProjectRoleID} from ProjectRoleServices");
            try {
                return await Context.ProjectRoles.FirstOrDefaultAsync(x => x.ProjectRoleID == ProjectRoleID) ?? throw new Exception("ProjectRole not found");
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetProjectRoleByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task AddProjectRoleAsync(ProjectRole projectRole) {
            Logger.LogInformation($"Called: {nameof(AddProjectRoleAsync)} from ProjectRoleServices");
            try {
                Context.ProjectRoles.Add(projectRole);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(AddProjectRoleAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task DeleteProjectRoleAsync(int ProjectRoleID) {
            Logger.LogInformation($"Called: {nameof(DeleteProjectRoleAsync)} from ProjectRoleServices");
            try {
                var existingProjectRole = await Context.ProjectRoles.FirstOrDefaultAsync(x => x.ProjectRoleID == ProjectRoleID);

                if (existingProjectRole == null)
                    return;

                Context.ProjectRoles.Remove(existingProjectRole);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(DeleteProjectRoleAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task UpdateProjectRoleAsync(ProjectRole projectRole, int ProjectRoleID) {
            Logger.LogInformation($"Called: {nameof(UpdateProjectRoleAsync)} from ProjectRoleServices");

            try {
                var existingProjectRole = await Context.ProjectRoles.FirstOrDefaultAsync(x => x.ProjectRoleID == ProjectRoleID);
                if (existingProjectRole == null)
                    return;

                existingProjectRole.ProjectRoleName = projectRole.ProjectRoleName;

                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(UpdateProjectRoleAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}
