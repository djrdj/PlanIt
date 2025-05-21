using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.Assignment;
using PlanIT.DataTransferModel.Comment;
using PlanIT.DataTransferModel.User;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    public class AssignmentServices : IAssignmentServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public INotificationServices notificationServices { get; }
        public AssignmentServices(ApplicationDbContext mContext, ILoggger loger, INotificationServices notificationServices)
        {
            Logger = loger;
            Context = mContext;
            notificationServices = notificationServices;
        }
        public async Task<List<Assignment>> GetAllAssignmentsAsync()
        {
            Logger.LogInformation($"Called: {nameof(GetAllAssignmentsAsync)} from AssignmentServices");
            try
            {
                var assignments =  await Context.Assignments.OrderBy(a => a.Deadline).ToListAsync();

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
                Logger.LogError($"Error in {nameof(GetAllAssignmentsAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<GetAssignmentByUserDTO>> GetAssignmentsForUserAsync(int userId) {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsForUserAsync)} from AssignmentServices");

            try {
                var assignments = await Context.UserAssignments
                .Where(ua => ua.UserID == userId)
                .Select(ua => new GetAssignmentByUserDTO
                {
                    AssignmentLeadID = ua.Assignment.AssignmentLeader.UserID,
                    AssignmentListName = ua.Assignment.AssignmentList.AssignmentListName,
                    AssignmentListID = ua.Assignment.AssignmentList.AssignmentListID,
                    AssignmentLeadURL = ua.Assignment.AssignmentLeader.PictureURL,
                    AssignmentLeadFirstName = ua.Assignment.AssignmentLeader.FirstName,
                    AssignmentLeadLastName = ua.Assignment.AssignmentLeader.LastName,
                    ProjectID = ua.Assignment.AssignmentList.ProjectID,
                    ProjectName = ua.Assignment.AssignmentList.Project.ProjectName,
                    AssignmentID = ua.Assignment.AssignmentID,
                    AssignmentName = ua.Assignment.AssignmentName,
                    Description = ua.Assignment.Description,
                    Status = ua.Assignment.Status,
                    Progress = ua.Assignment.Progress,
                    Priority = ua.Assignment.Priority,
                    CreationDate = ua.Assignment.CreationDate,
                    Deadline = ua.Assignment.Deadline,
                    CompletionTime = (DateTime)ua.Assignment.CompletionTime,
                    ParentAssignmentID = (int)ua.Assignment.ParentAssignmentID
                })
                .OrderBy(a => a.Deadline)
                .ToListAsync();

                return assignments;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAssignmentsForUserAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<GetAssignmentByUserDTO>> GetAssignmentsForProjectLeadAsync(int managerID) {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsForProjectLeadAsync)} from AssignmentServices");

            try {
                // Retrieve assignments for all projects where the ProjectLeadID matches the managerID
                var assignments = await Context.Projects
                    .Where(p => p.ProjectLeaderID == managerID ||
                        p.AssignmentLists.Any(al => al.Assignments.Any(a => a.UserAssignments.Any(ua => ua.UserID == managerID && ua.AssignmentID == a.AssignmentID))))
                    .SelectMany(p => p.AssignmentLists)
                    .SelectMany(al => al.Assignments)
                    .Select(a => new GetAssignmentByUserDTO
                    {
                        AssignmentLeadID = a.AssignmentLeader.UserID,
                        AssignmentListName = a.AssignmentList.AssignmentListName,
                        AssignmentListID = a.AssignmentList.AssignmentListID,
                        AssignmentLeadURL = a.AssignmentLeader.PictureURL,
                        AssignmentLeadFirstName = a.AssignmentLeader.FirstName,
                        AssignmentLeadLastName = a.AssignmentLeader.LastName,
                        ProjectID = a.AssignmentList.ProjectID,
                        ProjectName = a.AssignmentList.Project.ProjectName,
                        AssignmentID = a.AssignmentID,
                        AssignmentName = a.AssignmentName,
                        Description = a.Description,
                        Status = a.Status,
                        Progress = a.Progress,
                        Priority = a.Priority,
                        CreationDate = a.CreationDate,
                        Deadline = a.Deadline,
                        ParentAssignmentID = (int)a.ParentAssignmentID
                    })
                    .OrderBy(a => a.Deadline)
                    .ToListAsync();

                return assignments;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAssignmentsForProjectLeadAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> ArchiveAssignmentAsync(int AssignmentID)
        {
            Logger.LogInformation($"Called: {nameof(ArchiveAssignmentAsync)} from AssignmentServices");
            try
            {
                var existingAssignment = await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == AssignmentID);

                if (existingAssignment == null)
                    return -1;

                var dependentAssignments = Context.Assignments.Where(a => a.ParentAssignmentID == existingAssignment.AssignmentID && a.Status!="Completed" && a.Status!="Dismissed");

                if (dependentAssignments.Any())
                {
                    Logger.LogInformation($"There is assignments that depend on the current assignment from AssignmentServices");
                    return 0;
                }
                else
                {
                    existingAssignment.Status="Dismissed";
                    await Context.SaveChangesAsync();
                    return 1;
                } 
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(ArchiveAssignmentAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<Assignment> GetAssignmentByID(int AssignmentID)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentByID)} with AssignmentID: {AssignmentID} from AssignmentServices");
            try
            {
                // Retrieve the assignment with the specified ID
                var assignment = await Context.Assignments
                    .Include(a => a.AssignmentList)
                    .ThenInclude(al => al.Project)
                    .FirstOrDefaultAsync(x => x.AssignmentID == AssignmentID);
                Logger.LogInformation($"Got ${assignment}");
                // Throw exception if assignment is not found
                if (assignment == null)
                    throw new Exception("Assignment not found");
           
                return assignment;
                //return await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == AssignmentID) ?? throw new Exception("Assignment not found");
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task<Assignment> UpdateAssignmentAsync(Assignment assignment, int AssignmentID)
        {
            Logger.LogInformation($"Called: {nameof(UpdateAssignmentAsync)} from AssignmentServices");

            try
            {
                var existingAssignment = await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == AssignmentID);
                if (existingAssignment == null)
                    return null;


               /* DateTime currentDate = DateTime.Now.Date;
                if (assignment.Deadline.Date < currentDate)
                {
                    Logger.LogInformation($"Deadline ne moze biti pre danasnjeg dana. from AssignmentServices");
                    return null;
                }
                else
                {*/
                    existingAssignment.Progress = (assignment.Progress == null)? existingAssignment.Progress : assignment.Progress ;
                    existingAssignment.AssignmentLeadID = assignment.AssignmentLeadID;
                    existingAssignment.AssignmentName = assignment.AssignmentName;
                    existingAssignment.Description = assignment.Description;
                    existingAssignment.Status = assignment.Status;
                    existingAssignment.Priority = assignment.Priority;
                    existingAssignment.Deadline = assignment.Deadline;
                    existingAssignment.CreationDate = (assignment.CreationDate == DateTime.MinValue) ? existingAssignment.CreationDate : assignment.CreationDate;
                    existingAssignment.ParentAssignmentID = assignment.ParentAssignmentID;
                    existingAssignment.AssignmentListID = assignment.AssignmentListID;
                    await Context.SaveChangesAsync();
                    return assignment;
               // }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateAssignmentAsync)}: {ex.Message}");
                throw;
            }

        }
        public async Task<Assignment> AddAssignmentAsync(Assignment assignment)
        {
            Logger.LogInformation($"Called: {nameof(AddAssignmentAsync)} from AssignmentServices");
            Logger.LogInformation($"{assignment.AssignmentListID}, {assignment.AssignmentName}");
            try
            {
                DateTime currentDate = DateTime.Now.Date;

               
                var assignmentList = await Context.AssignmentLists.FindAsync(assignment.AssignmentListID);
                assignment.AssignmentList = assignmentList;

                if (assignment.AssignmentList == null) {
                Logger.LogInformation($"AssignmentList is null for assignment: {assignment.AssignmentID}");
                return null;
                }

                var project = await Context.Projects.FindAsync(assignment.AssignmentList.ProjectID);

                if (project == null)
                {
                    Logger.LogInformation($"Project not found for assignment: {assignment.AssignmentID}");
                    return null;
                }
                
                if (assignment.CreationDate.Date < project.StartDate.Date || assignment.Deadline.Date > project.EndDate.Date) // OPSEG PROJEKTA
                {
                    Logger.LogInformation($"CreationDate or Deadline is outside of the project duration for assignment: {assignment.AssignmentID}");
                    return null;
                }
                else if (assignment.Deadline.Date < assignment.CreationDate.Date) // REDOSLED POCETKA I KRAJA
                {
                    Logger.LogInformation($"Deadline ne moze biti pre CreationDate-a. from AssignmentServices");
                    return null;
                }    
                else if (assignment.CreationDate.Date < currentDate) 
                {
                    Logger.LogInformation($"CreationDate ne moze biti pre danasnjeg datuma. from AssignmentServices");
                    return null;
                }
                else 
                if (assignment.CreationDate.Date > currentDate)
                {
                    assignment.Status = "Planned";
                    Context.Assignments.Add(assignment);
                    await Context.SaveChangesAsync();
                    return assignment;
                }
                else
                {
                    assignment.Status = "In Progress";
                    Context.Assignments.Add(assignment);
                    await Context.SaveChangesAsync();
                    return assignment;
                }   
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddAssignmentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<GetAssignmentWithCommentsDTO> getAssignmentWithCommentsAsync(int AssignmentID)
        {
            var assignment = await Context.Assignments
                .Include(a => a.Comments)
                .FirstOrDefaultAsync(a => a.AssignmentID == AssignmentID);

            if (assignment == null)
            {
                return null;
            }
            var assignmentDetails = await Context.Assignments
            .Where(a => a.AssignmentID == AssignmentID)
            .Select(a => new GetAssignmentWithCommentsDTO
            {
                Status = a.Status,
                Progress = (int)a.Progress,
                ParentAssignmentID = (int)a.ParentAssignmentID,
                ParentAssignmentName = a.ParentAssignmentID != null ?
                Context.Assignments
                    .Where(parent => parent.AssignmentID == a.ParentAssignmentID)
                    .Select(parent => parent.AssignmentName)
                    .FirstOrDefault()
                    : "",
               
                AssignmentListID = a.AssignmentListID,
                AssignmentListName = a.AssignmentList.AssignmentListName,
                AssignmentID = a.AssignmentID,
                AssignmentName = a.AssignmentName,
                ProjectName =(from assignment in Context.Assignments
                                                 join assignmentList in Context.AssignmentLists
                                                 on assignment.AssignmentListID equals assignmentList.AssignmentListID
                                                 join project in Context.Projects
                                                 on assignmentList.ProjectID equals project.ProjectID
                                                 where assignment.AssignmentID == AssignmentID
                                                 select project.ProjectName)
                  .FirstOrDefault(),
                ProjectID = (from assignment in Context.Assignments
                             join assignmentList in Context.AssignmentLists
                             on assignment.AssignmentListID equals assignmentList.AssignmentListID
                             join project in Context.Projects
                             on assignmentList.ProjectID equals project.ProjectID
                             where assignment.AssignmentID == AssignmentID
                             select project.ProjectID)
                  .FirstOrDefault(),
                AssignmentPriority = a.Priority,
                AssignmentLeadID = a.AssignmentLeader.UserID,
                AssignmentLeaderUsername = a.AssignmentLeader.Username,
                AssignmentLeaderPictureURL = a.AssignmentLeader.PictureURL,
                AssignmentLeaderFirstName = a.AssignmentLeader.FirstName,
                AssignmentLeaderLastName = a.AssignmentLeader.LastName,
                AssignmentCreationDate = a.CreationDate,
                AssignmentDeadLine = a.Deadline,
                AssignmentDescription = a.Description,
                AssignedUsers = a.UserAssignments.Select(ua => new AssigneeDTO
                {
                    UserID = ua.User.UserID,
                    Username = ua.User.Username,
                    PictureURL = ua.User.PictureURL,
                    Type = ua.Type
                })
                .Where(ua => ua.Type == 0)
                .ToList(),
                Comments = a.Comments.Select(c => new CommentDTO
                {
                    CommentID = c.CommentID,
                    UserID = c.User.UserID,
                    Username = c.User.Username,
                    UserPictureURL = c.User.PictureURL,
                    CommentText = c.CommentText,
                    CreationDate = c.CreationDate
                }).ToList()
            })
            .OrderBy(a => a.AssignmentDeadLine)
            .FirstOrDefaultAsync();

            return assignmentDetails;
        }

        public async Task<User> GetUserLeaderByAssignmentID(int assignmentID)
        {
            Logger.LogInformation($"Called: {nameof(GetUserLeaderByAssignmentID)} from AssignmentServices");

            try
            {
                var assignmentLeader = await Context.Assignments
                .Where(a => a.AssignmentID == assignmentID)
                .Select(a => a.AssignmentLeader)
                .FirstOrDefaultAsync();

                return assignmentLeader;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddAssignmentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetAssignmentCountForUserAsync(int UserId)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentCountForUserAsync)} from AssignmentServices");

            try
            {
                var assignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == UserId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                var assignments = await Context.Assignments
                    .Where(a => assignmentIds.Contains(a.AssignmentID))
                    .ToListAsync();

                foreach (var assignment in assignments)
                {
                    if (assignment.AssignmentLeadID != null)
                    {
                        var user = await Context.Users.FindAsync(assignment.AssignmentLeadID);
                        if (user != null)
                        {
                            assignment.AssignmentLeader = user;
                        }
                    }
                }

                return assignments.Count;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentCountForUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetActiveAssignmentCountForUserAsync(int UserId)
        {
            Logger.LogInformation($"Called: {nameof(GetActiveAssignmentCountForUserAsync)} from AssignmentServices");
            try
            {
                var assignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == UserId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                var inProgressAssignmentCount = await Context.Assignments
                    .Where(a => assignmentIds.Contains(a.AssignmentID) && a.Status == "In Progress")
                    .CountAsync();

                return inProgressAssignmentCount;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetActiveAssignmentCountForUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetCompletedAssignmentCountForUserAsync(int UserId)
        {
            Logger.LogInformation($"Called: {nameof(GetCompletedAssignmentCountForUserAsync)} from AssignmentServices");
            try
            {
                var assignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == UserId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                var inProgressAssignmentCount = await Context.Assignments
                    .Where(a => assignmentIds.Contains(a.AssignmentID) && a.Status == "Completed")
                    .CountAsync();

                return inProgressAssignmentCount;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetCompletedAssignmentCountForUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<User_Assignment>> AddEmployeesToAssignmentAsync(int assignmentId, int[] userIds)
        {
            Logger.LogInformation($"Called: {nameof(AddEmployeesToAssignmentAsync)} from AssignmentServices");
            try
            {
                var userAssignments = new List<User_Assignment>();

                foreach (var userId in userIds)
                {
                    var existingUserAssignment = await Context.UserAssignments.FirstOrDefaultAsync(ua => ua.UserID == userId && ua.AssignmentID == assignmentId && ua.Type == 0);

                    if (existingUserAssignment != null)
                    {
                        continue;
                    }
                    var userAssignment = new User_Assignment
                    {
                        UserID = userId,
                        AssignmentID = assignmentId,
                        Type = 0
                    };

                    Context.UserAssignments.Add(userAssignment);
                    userAssignments.Add(userAssignment);
                }
                await Context.SaveChangesAsync();
                //await notificationServices.TriggerTaskNotification(assignmentId);
                return userAssignments;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddEmployeesToAssignmentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<User_Assignment> AddAssignmentLeaderToAssignmentAsync(int assignmentId, int assignmentLeadID)
        {
            Logger.LogInformation($"Called: {nameof(AddAssignmentLeaderToAssignmentAsync)} from ProjectServices");
            try
            {
                var userAssignment = new User_Assignment
                {
                    UserID = assignmentLeadID,
                    AssignmentID = assignmentId,
                    Type  = 1
                };

                Context.UserAssignments.Add(userAssignment);
                await Context.SaveChangesAsync();
                return userAssignment;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddAssignmentLeaderToAssignmentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<User_Assignment>> RemoveEmployeesToAssignmentAsync(int assignmentId, int[] userIds)
        {
            Logger.LogInformation($"Called: {nameof(RemoveEmployeesToAssignmentAsync)} from AssignmentServices");
            try
            {
                var userAssignments = new List<User_Assignment>();

                foreach (var userId in userIds)
                {
                    var userAssignment = new User_Assignment
                    {
                        UserID = userId,
                        AssignmentID = assignmentId,
                        Type = 0
                    };

                    Context.UserAssignments.Remove(userAssignment);
                    userAssignments.Add(userAssignment);
                }

                await Context.SaveChangesAsync();

                return userAssignments;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(RemoveEmployeesToAssignmentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> ChangeStatus(int assignmentId, string status)
        {
            Logger.LogInformation($"Called: {nameof(ChangeStatus)} from AssignmentServices");

            try
            {
                var assignment = await Context.Assignments.FindAsync(assignmentId);

                if (assignment == null)
                {
                    Logger.LogError($"Assignment with ID {assignmentId} not found.");
                    return -1;
                }
                if (status == "Completed")
                {
                    assignment.CompletionTime = DateTime.Now;
                }
                else
                {
                    assignment.CompletionTime = null;
                }
                assignment.Status = status;
                await Context.SaveChangesAsync();

                return 1;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(ChangeStatus)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<AssignmentWithListDTO>> GetAssignmentsByProjectAndUserAsync(int projectId, int userId)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsByProjectAndUserAsync)} from AssignmentServices");

            try
            {
                var assignments = await Context.Assignments
                    .Include(a => a.AssignmentList)
                    .Include(a => a.AssignmentLeader)
                    .Where(a => a.AssignmentList.ProjectID == projectId && a.UserAssignments.Any(ua => ua.UserID == userId))
                    .Select(a => new AssignmentWithListDTO
                    {
                        AssignmentID = a.AssignmentID,
                        AssignmentName = a.AssignmentName,
                        AssignmentLeadID = a.AssignmentLeadID,
                        AssignmentLeadURL = a.AssignmentLeader.PictureURL,
                        AssignmentLeadFirstName = a.AssignmentLeader.FirstName,
                        AssignmentLeadLastName = a.AssignmentLeader.LastName,
                        Description = a.Description,
                        Status = a.Status,
                        Priority = a.Priority,
                        Progress = a.Progress,
                        CreationDate = a.CreationDate,
                        Deadline = a.Deadline,
                        AssignmentListID = a.AssignmentListID,
                        AssignmentListName = a.AssignmentList.AssignmentListName,
                        ParentAssignmentID = a.ParentAssignmentID
                    })
                    .ToListAsync();

                return assignments;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentsByProjectAndUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetCompletedAssignmentCountForUserAsync(int userId, int projectId)
        {
            Logger.LogInformation($"Called: {nameof(GetCompletedAssignmentCountForUserAsync)} from AssignmentServices");
            try
            {
                var assignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == userId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                var completedAssignmentCount = await Context.Assignments
                    .Where(a => assignmentIds.Contains(a.AssignmentID) && a.Status == "Completed" && a.AssignmentList.ProjectID == projectId)
                    .CountAsync();

                return completedAssignmentCount;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetCompletedAssignmentCountForUserAsync)}: {ex.Message}");
                throw;
            }
        }


        public async Task<int> GetPlannedAssignmentCountForUserAsync(int userId, int projectId)
        {
            Logger.LogInformation($"Called: {nameof(GetPlannedAssignmentCountForUserAsync)} from AssignmentServices");
            try
            {
                var assignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == userId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                var completedAssignmentCount = await Context.Assignments
                    .Where(a => assignmentIds.Contains(a.AssignmentID) && a.Status == "Planned" && a.AssignmentList.ProjectID == projectId)
                    .CountAsync();

                return completedAssignmentCount;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetPlannedAssignmentCountForUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetInProgressAssignmentCountForUserAsync(int userId, int projectId)
        { 
            Logger.LogInformation($"Called: {nameof(GetInProgressAssignmentCountForUserAsync)} from AssignmentServices");
            try
            {
                var assignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == userId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                var completedAssignmentCount = await Context.Assignments
                    .Where(a => assignmentIds.Contains(a.AssignmentID) && a.Status == "In Progress" && a.AssignmentList.ProjectID == projectId)
                    .CountAsync();

                return completedAssignmentCount;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetInProgressAssignmentCountForUserAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}
