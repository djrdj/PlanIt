using PlanIT.DataTransferModel.Assignment;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IAssignmentListServices
    {
        Task<List<AssignmentList>> GetAllAssignmentListsAsync();
        Task<AssignmentList> GetAssignmentListByID(int AssignmentListID);
        Task AddAssignmentListAsync(AssignmentList assignmentList);
        Task DeleteAssignmentListAsync(int AssignmentListID);
        Task UpdateAssignmentListAsync(AssignmentList assignmentList, int AssignmentListID);
        Task<List<AssignmentList>> GetAssignmentListsForProjectAsync(int projectId);
        Task<List<Assignment>> GetAssignmentsForProjectAndUserAsync(int projectId, int userId);
        Task<List<Assignment>> GetAssignmentsForAssignmentListAndUserAsync(int assignmentListId, int userId);
        Task<List<Assignment>> GetAssignmentsByAssignmentListID(int AssignmentListID);
    }
}
