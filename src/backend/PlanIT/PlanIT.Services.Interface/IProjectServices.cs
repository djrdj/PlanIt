using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IProjectServices
    {
        Task<List<GetProjectDetailsDTO>> GetAllProjectsAsync();
        Task<Project> GetProjectByID(int ProjectID);
        Task<GetProjectDetailsDTO> GetProjectWithLeaderInformation(int projectID);
        Task<Project> AddProjectAsync(Project project);
        Task ArchiveProjectAsync(int ProjectID);
        Task<Project> UpdateProjectAsync(Project project, int ProjectID);
        Task<int> GetUserCountForProject(int ProjectID);
        Task<int> GetActiveTasksCountByProject(int ProjectID);
        Task<int> GetInActiveTasksCountByProject(int ProjectID);
        Task<string> GetProjectNameByAssignmentID(int assignmentID);
        Task<List<UsersByProjectDTO>> GetUsersByProjectID(int ProjectID);
        Task<List<Assignment>> GetAssignmentsByProjectID(int ProjectID);
        Task<List<AssignmentList>> GetAssignmentListsByProjectID(int ProjectID);
        Task<User_Project> AddProjectLeaderToProjectAsync(int projectId, int projectLeaderId);
        Task<List<User_Project>> AddEmployeesToProjectAsync(int projectId, int[] userIds);
        Task<List<User_Project>> RemoveEmployeesToProjectAsync(int projectId, int[] userIds);
    }
}