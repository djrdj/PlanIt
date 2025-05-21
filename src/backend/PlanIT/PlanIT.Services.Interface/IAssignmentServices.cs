using PlanIT.DataTransferModel.Assignment;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IAssignmentServices
    {
        Task<List<Assignment>> GetAllAssignmentsAsync();
        Task<List<GetAssignmentByUserDTO>> GetAssignmentsForUserAsync(int UserId);
        Task<List<GetAssignmentByUserDTO>> GetAssignmentsForProjectLeadAsync(int managerID);
        Task<int> GetAssignmentCountForUserAsync(int UserId);
        Task<int> GetActiveAssignmentCountForUserAsync(int UserId);
        Task<int> GetCompletedAssignmentCountForUserAsync(int UserId);
        Task<Assignment> GetAssignmentByID(int AssignmentID);
        Task<Assignment> AddAssignmentAsync(Assignment assignment);
        Task<int> ArchiveAssignmentAsync(int AssignmentID);
        Task<Assignment> UpdateAssignmentAsync(Assignment assignment, int AssignmentID);
        Task <GetAssignmentWithCommentsDTO> getAssignmentWithCommentsAsync(int AssignmentID);
        Task<User> GetUserLeaderByAssignmentID(int AssignmentID);
        Task<User_Assignment> AddAssignmentLeaderToAssignmentAsync(int assignmentId, int assignmentLeadID);
        Task<List<User_Assignment>> AddEmployeesToAssignmentAsync(int assignmentId, int[] userIds);
        Task<List<User_Assignment>> RemoveEmployeesToAssignmentAsync(int assignmentId, int[] userIds);
        Task<int> ChangeStatus(int assignmentId, string status);
        Task<List<AssignmentWithListDTO>> GetAssignmentsByProjectAndUserAsync(int projectId, int userId);
        Task<int> GetCompletedAssignmentCountForUserAsync(int userId, int projectId);
        Task<int> GetPlannedAssignmentCountForUserAsync(int userId, int projectId);
        Task<int> GetInProgressAssignmentCountForUserAsync(int userId, int projectId);

    }
}
