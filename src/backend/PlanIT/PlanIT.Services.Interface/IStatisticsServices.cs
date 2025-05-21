
using PlanIT.DataTransferModel.User;
using PlanIT.Models;

namespace PlanIT.Services.Interface {
    public interface IStatisticsServices {
        Task<SortedDictionary<DateTime, int>> GetCommentsCountByDate(int projectID);
        Task<SortedDictionary<DateTime, int>> GetCommentsCountByDateAndAssignmentList(int projectID, int assignmentListID);

        Task<UserWithCountDTO> GetUserWithMostComments(int projectId);
        Task<UserWithCountDTO> GetUserWithMostCommentsByAssignmentList(int projectId, int assignmentListID); 

        Task<List<UserWithCountDTO>> GetUsersWithTaskCounts(int projectID);
        Task<List<UserWithCountDTO>> GetUsersWithTaskCountsByAssignmentListID(int projectID, int assignmentListID);

        Task<int> GetUniqueUserCountForProject(int projectID);
        Task<int> GetUniqueUserCountForProjectAndAssignmentList(int projectID, int assignmentListID);

        Task<int> GetHighPriorityTaskCountForProject(int projectID);
        Task<int> GetHighPriorityTaskCountForProjectByAssignmentList(int projectID, int assignmentListID);
        

        Task<(double inProgressMean, double plannedMean)> CalculateProgressMeans(int projectID);
        Task<(double inProgressMean, double plannedMean)> CalculateProgressMeansByAssignmentList(int projectID, int assignmentListID);

        Task<List<UserWithCountDTO>> GetUsersWithCompletedTaskCounts(int projectID);
        Task<List<UserWithCountDTO>> GetUsersWithCompletedTaskCountsByAssignmentList(int projectID, int assignmentListID);

        Task<Dictionary<string, int>> GetTaskCountsByStatus(int projectID);
        Task<Dictionary<string, int>> GetTaskCountsByStatusAndAssignmentList(int projectID, int assignmentListID);

        Task<List<Dictionary<int, SortedDictionary<DateTime, double>>>> GetAverageTimeToCompleteTask(int projectID);
    }
}
