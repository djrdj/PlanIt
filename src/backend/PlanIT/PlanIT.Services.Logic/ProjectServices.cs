using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Project = PlanIT.Models.Project;

namespace PlanIT.Services.Logic
{
    public class ProjectServices : IProjectServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public INotificationServices notificationServices { get; }
        public ProjectServices(ApplicationDbContext mContext, ILoggger loger, INotificationServices notificationServices)
        {
            Logger = loger;
            Context = mContext;
            this.notificationServices = notificationServices;
        }
        public async Task<Project> AddProjectAsync(Project project)
        {
            Logger.LogInformation($"Called: {nameof(AddProjectAsync)} from ProjectServices");
            try
            {
                DateTime currentDate = DateTime.Now.Date;
                if (project.EndDate.Date < project.StartDate.Date)
                {
                    Logger.LogInformation($"EndDate ne moze biti pre StartDate. from ProjectServices");
                    return null;
                }
                else if (project.StartDate.Date > currentDate)
                {
                    project.Status = "Planned";
                    Context.Projects.Add(project);
                    await Context.SaveChangesAsync();
                    return project;
                }
                else if (project.StartDate.Date < currentDate)
                {
                    Logger.LogInformation($"StartDate ne moze biti pre danasnjeg datuma. from ProjectServices");
                    return null;
                }
                else
                {
                    project.Status = "In Progress";
                    Context.Projects.Add(project);
                    await Context.SaveChangesAsync();
                    return project;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddProjectAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task ArchiveProjectAsync(int ProjectID)
        {
            Logger.LogInformation($"Called: {nameof(ArchiveProjectAsync)} from ProjectServices");
            try
            {
                var existingProject = await Context.Projects
                    .Include(p => p.AssignmentLists)
                    .ThenInclude(al => al.Assignments)
                    .FirstOrDefaultAsync(x => x.ProjectID == ProjectID);

                if (existingProject == null)
                    return;

                existingProject.Status = "Dismissed";

                foreach (var assignmentList in existingProject.AssignmentLists)
                {
                    foreach (var assignment in assignmentList.Assignments)
                    {
                        assignment.Status = "Dismissed";
                    }
                }
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(ArchiveProjectAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<GetProjectDetailsDTO>> GetAllProjectsAsync()
        {
            Logger.LogInformation($"Called: {nameof(GetAllProjectsAsync)} from ProjectServices");
            try
            {
                var projects = await Context.Projects
                    .Include(p => p.ProjectLeader)
                    .OrderBy(p => p.EndDate)
                    .ToListAsync();

                var projectDetails = projects.Select(p => new GetProjectDetailsDTO
                {
                    ProjectID = p.ProjectID,
                    ProjectName = p.ProjectName,
                    Description = p.Description,
                    Status = p.Status,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    ProjectLeaderID = p.ProjectLeaderID,
                    ProjectLeaderFirstName = p.ProjectLeader.FirstName,
                    ProjectLeaderLastName = p.ProjectLeader.LastName,
                    ProjectLeaderURL = p.ProjectLeader.PictureURL
                })
                .OrderBy(a => a.EndDate)
                .ToList();

                return projectDetails;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAllProjectsAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<Project> GetProjectByID(int projectID)
        {
            Logger.LogInformation($"Called: {nameof(GetProjectByID)} with ProjectID: {projectID} from ProjectServices");
            try
            {
                return await Context.Projects
                    .Include (p => p.ProjectLeader)
                    .FirstOrDefaultAsync(x => x.ProjectID == projectID) ?? throw new Exception("Project not found");
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetProjectByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task<GetProjectDetailsDTO> GetProjectWithLeaderInformation(int projectID) {
            Logger.LogInformation($"Called: {nameof(GetProjectByID)} with ProjectID: {projectID} from ProjectServices");
            try {
                var project =  await Context.Projects
                    .Include(p => p.ProjectLeader)
                    .FirstOrDefaultAsync(x => x.ProjectID == projectID) ?? throw new Exception("Project not found");

                var returnProject = new GetProjectDetailsDTO {
                    ProjectID = project.ProjectID,
                    ProjectName = project.ProjectName,
                    Description = project.Description,
                    Status = project.Status,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    ProjectLeaderID = project.ProjectLeaderID,
                    ProjectLeaderFirstName = project.ProjectLeader.FirstName,
                    ProjectLeaderLastName = project.ProjectLeader.LastName,
                    ProjectLeaderURL = project.ProjectLeader.PictureURL
                };

                return returnProject;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetProjectByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task<Project> UpdateProjectAsync(Project project, int ProjectID)
        {
            Logger.LogInformation($"Called: {nameof(UpdateProjectAsync)} from ProjectServices");

            try
            {
                var existingProject = await Context.Projects.FirstOrDefaultAsync(x => x.ProjectID == ProjectID);
                if (existingProject == null)
                    return null;

                DateTime currentDate = DateTime.Now.Date;
                //if (project.EndDate.Date < currentDate)
                //{
                //    Logger.LogInformation($"EndDate ne moze biti pre danasnjeg dana. from ProjectServices");
                //    return null;
                //}
                //else
                //{
                    existingProject.ProjectName = project.ProjectName;
                    existingProject.Description = project.Description;
                    existingProject.EndDate = project.EndDate;
                    await Context.SaveChangesAsync();
                    return project;
                //}
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateProjectAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<int> GetUserCountForProject(int ProjectID)
        {
            Logger.LogInformation($"Called: {nameof(GetUserCountForProject)} from ProjectServices");

            try
            {
                return await Context.UserProjects
                    .Where(up => up.ProjectID == ProjectID)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetUserCountForProject)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetActiveTasksCountByProject(int ProjectID)
        {
            Logger.LogInformation($"Called: {nameof(GetActiveTasksCountByProject)} from ProjectServices");

            try
            {
                return await Context.Assignments
                    .Where(a => a.AssignmentList.ProjectID == ProjectID && a.Status == "In Progress")
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetActiveTasksCountByProject)}: {ex.Message}");
                throw;
            }
        }
        public async Task<int> GetInActiveTasksCountByProject(int ProjectID)
        {
            Logger.LogInformation($"Called: {nameof(GetInActiveTasksCountByProject)} from ProjectServices");

            try
            {
                return await Context.Assignments
                    .Where(a => a.AssignmentList.ProjectID == ProjectID && a.Status == "Dismissed")
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetInActiveTasksCountByProject)}: {ex.Message}");
                throw;
            }
        }

        public async Task<string> GetProjectNameByAssignmentID(int assignmentID)
        {
            Logger.LogInformation($"Called: {nameof(GetProjectNameByAssignmentID)} from ProjectServices");

            try
            {
                var projectName = await Context.Assignments
                    .Where(a => a.AssignmentID == assignmentID)
                    .Select(a => a.AssignmentList.Project.ProjectName)
                    .FirstOrDefaultAsync();

                return projectName;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetProjectNameByAssignmentID)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<UsersByProjectDTO>> GetUsersByProjectID(int ProjectID)
        {
            Logger.LogInformation($"Called: {nameof(GetUsersByProjectID)} from ProjectServices");

            var users = await Context.UserProjects
            .Where(up => up.ProjectID == ProjectID)
            .Select(up => new UsersByProjectDTO
            {
                Id = up.User.UserID,
                Username = up.User.Username,
                FirstName = up.User.FirstName,
                LastName = up.User.LastName,
                PictureURL = up.User.PictureURL
            })
            .ToListAsync();

                return users;
            }

        public async Task<List<Assignment>> GetAssignmentsByProjectID(int projectID)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsByProjectID)} from ProjectServices");
            try
            {
                var assignments = await Context.Assignments
                .Include(a => a.AssignmentList)
                .Where(a => a.AssignmentList.ProjectID == projectID)
                .OrderBy(a => a.Deadline)
                .ToListAsync();

                foreach (var assignment in assignments) {
                    if (assignment.AssignmentLeadID != null) {
                        var user = await Context.Users.FindAsync(assignment.AssignmentLeadID);
                        if (user != null) {
                            assignment.AssignmentLeader = user;
                        }
                    }
                }

                return assignments;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentsByProjectID)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<AssignmentList>> GetAssignmentListsByProjectID(int projectID)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentListsByProjectID)} from ProjectServices");
            try
            {
                var assignmentLists = await Context.AssignmentLists
                .Where(al => al.ProjectID == projectID)
                .ToListAsync();

                return assignmentLists;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentListsByProjectID)}: {ex.Message}");
                throw;
            }

        }
        public async Task<User_Project> AddProjectLeaderToProjectAsync(int projectId, int projectLeaderId)
        {
            Logger.LogInformation($"Called: {nameof(AddProjectLeaderToProjectAsync)} from ProjectServices");
            try
            {
                var userProject = new User_Project
                {
                    UserID = projectLeaderId,
                    ProjectID = projectId
                };

                Context.UserProjects.Add(userProject);
                await Context.SaveChangesAsync();
                //await notificationServices.TriggerProjectNotification(projectId);
                return userProject;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddProjectLeaderToProjectAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<User_Project>> AddEmployeesToProjectAsync(int projectId, int[] userIds)
        {
            Logger.LogInformation($"Called: {nameof(AddEmployeesToProjectAsync)} from ProjectServices");
            try
            {
                var userProjects = new List<User_Project>();

                foreach (var userId in userIds)
                {
                    var userProject = new User_Project
                    {
                        UserID = userId,
                        ProjectID = projectId
                    };

                    Context.UserProjects.Add(userProject);
                    userProjects.Add(userProject);
                }

                await Context.SaveChangesAsync();
                //await notificationServices.TriggerProjectNotification(projectId);
                return userProjects;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddEmployeesToProjectAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<User_Project>> RemoveEmployeesToProjectAsync(int projectId, int[] userIds)
        {
            Logger.LogInformation($"Called: {nameof(RemoveEmployeesToProjectAsync)} from ProjectServices");
            try
            {
                var userProjects = new List<User_Project>();

                foreach (var userId in userIds)
                {
                    var userProject = new User_Project
                    {
                        UserID = userId,
                        ProjectID = projectId
                    };

                    Context.UserProjects.Remove(userProject);
                    userProjects.Add(userProject);
                }

                await Context.SaveChangesAsync();

                return userProjects;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(RemoveEmployeesToProjectAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}