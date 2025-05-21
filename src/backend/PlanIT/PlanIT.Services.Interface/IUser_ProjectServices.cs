using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IUser_ProjectServices
    {
        Task<List<User_Project>> GetAllUserProjectsAsync();
        Task<List<Project>> GetProjectsByUserID(int UserID);
        Task<List<User>> GetUsersByProjectID(int ProjectID);
        Task<User_Project> AddUserProjectAsync(User_Project userProject);
        Task DeleteUserProjectAsync(int UserID, int ProjectID);
        Task UpdateUserProjectAsync(User_Project userProject, int UserID, int ProjectID);
        Task<int> GetProjectCountByUserID(int UserID);
        Task<int> GetActiveProjectCountByUserID(int UserID);
        Task<int> GetPlannedProjectCountByUserID(int UserID);
        Task<int> GetCompletedProjectCountByUserID(int UserID);
        Task AddKanbanColumnsForUserInProjectAsync(int userId, int projectId);
    }
}
