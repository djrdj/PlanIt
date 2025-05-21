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
    public class User_ProjectServices : IUser_ProjectServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public User_ProjectServices(ApplicationDbContext mContext, ILoggger loger) {
            Logger = loger;
            Context = mContext;
        }

        public async Task<List<User_Project>> GetAllUserProjectsAsync() {
            Logger.LogInformation($"Called: {nameof(GetAllUserProjectsAsync)} from User_ProjectServices");
            try {
                return await Context.UserProjects.ToListAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAllUserProjectsAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<Project>> GetProjectsByUserID(int UserID) {
            Logger.LogInformation($"Called: {nameof(GetProjectsByUserID)} from User_ProjectServices");
            try {
                var userProjects = await Context.UserProjects
                                            .Where(up => up.UserID == UserID)
                                            .Include(up => up.Project)
                                            .Select(up => up.Project)
                                            .ToListAsync();

                return userProjects;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetProjectsByUserID)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<User>> GetUsersByProjectID(int ProjectID) {
            Logger.LogInformation($"Called: {nameof(GetUsersByProjectID)} from User_ProjectServices");
            try {
                var projectUsers = await Context.UserProjects
                                            .Where(up => up.ProjectID == ProjectID)
                                            .Include(up => up.User)
                                            .Select(up => up.User)
                                            .ToListAsync();

                return projectUsers;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetUsersByProjectID)}: {ex.Message}");
                throw;
            }
        }
        public async Task<User_Project> AddUserProjectAsync(User_Project userProject) {
            Logger.LogInformation($"Called: {nameof(AddUserProjectAsync)} from User_ProjectServices");
            try {
                Context.UserProjects.Add(userProject);
                await Context.SaveChangesAsync();
                return userProject;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(AddUserProjectAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task DeleteUserProjectAsync(int UserID, int ProjectID) {
            Logger.LogInformation($"Called: {nameof(DeleteUserProjectAsync)} from User_ProjectServices");
            try {
                var existingUserProject = await Context.UserProjects.FirstOrDefaultAsync(x => x.UserID == UserID && x.ProjectID == ProjectID);

                if (existingUserProject == null)
                    return;

                Context.UserProjects.Remove(existingUserProject);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(DeleteUserProjectAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task UpdateUserProjectAsync(User_Project userProject, int UserID, int ProjectID) {
            Logger.LogInformation($"Called: {nameof(UpdateUserProjectAsync)} from User_ProjectServices");
            try {
                var existingUserProject = await Context.UserProjects.FirstOrDefaultAsync(x => x.UserID == UserID && x.ProjectID == ProjectID);
                if (existingUserProject == null)
                    return;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(UpdateUserProjectAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetProjectCountByUserID(int UserID)
        {
            Logger.LogInformation($"Called: {nameof(GetProjectCountByUserID)} from User_ProjectServices");
            try
            {
                var userProjects = await Context.UserProjects
                                            .Where(up => up.UserID == UserID)
                                            .Include(up => up.Project)
                                            .Select(up => up.Project)
                                            .ToListAsync();

                return userProjects.Count;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetProjectCountByUserID)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetActiveProjectCountByUserID(int UserID)
        {
            Logger.LogInformation($"Called: {nameof(GetActiveProjectCountByUserID)} from User_ProjectServices");
            try
            {
                var userProjects = await Context.UserProjects
                                        .Where(up => up.UserID == UserID)
                                        .Include(up => up.Project)
                                        .Where(up => up.Project.Status == "In Progress")
                                        .Select(up => up.Project)
                                        .ToListAsync();

                return userProjects.Count;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetActiveProjectCountByUserID)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetCompletedProjectCountByUserID(int UserID)
        {
            Logger.LogInformation($"Called: {nameof(GetCompletedProjectCountByUserID)} from User_ProjectServices");
            try
            {
                var userProjects = await Context.UserProjects
                                        .Where(up => up.UserID == UserID)
                                        .Include(up => up.Project)
                                        .Where(up => up.Project.Status == "Completed")
                                        .Select(up => up.Project)
                                        .ToListAsync();

                return userProjects.Count;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetCompletedProjectCountByUserID)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetPlannedProjectCountByUserID(int UserID)
        {
            Logger.LogInformation($"Called: {nameof(GetPlannedProjectCountByUserID)} from User_ProjectServices");
            try
            {
                var userProjects = await Context.UserProjects
                                        .Where(up => up.UserID == UserID)
                                        .Include(up => up.Project)
                                        .Where(up => up.Project.Status == "Planned")
                                        .Select(up => up.Project)
                                        .ToListAsync();

                return userProjects.Count;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetPlannedProjectCountByUserID)}: {ex.Message}");
                throw;
            }
        }

        public async Task AddKanbanColumnsForUserInProjectAsync(int userId, int projectId)
        {
            Logger.LogInformation($"Called: {nameof(AddKanbanColumnsForUserInProjectAsync)} from User_ProjectServices");
            try
            {
                var project = await Context.Projects
                .Include(p => p.AssignmentLists)
                .ThenInclude(al => al.Assignments)
                .FirstOrDefaultAsync(p => p.ProjectID == projectId);

            if (project == null)
            {
                throw new Exception($"Project with ID {projectId} not found.");
            }

            var assignmentStatuses = project.AssignmentLists
                .SelectMany(al => al.Assignments)
                .Select(a => a.Status)
                .Distinct()
                .ToList();

            if (assignmentStatuses == null || !assignmentStatuses.Any())
            {
                throw new Exception("No statuses found for the project assignments.");
            }

            var kanbanColumns = new List<KanbanColumn>();

            int index = 1;
            foreach (var status in assignmentStatuses)
            {
                var kanbanColumn = new KanbanColumn
                {
                    UserID = userId,
                    ProjectID = projectId,
                    Status = status,
                    Index = index++
                };

                kanbanColumns.Add(kanbanColumn);
            }

            Context.KanbanColumns.AddRange(kanbanColumns);
            await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddKanbanColumnsForUserInProjectAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}

