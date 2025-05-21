using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.User;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic {
    public class StatisticsServices : IStatisticsServices {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public StatisticsServices(ApplicationDbContext mContext, ILoggger loger) {
            Logger = loger;
            Context = mContext;
        }

        /* ----------------------------------------------------------   KOMENTARI PO DATUMU    ----------------------------------------------------------------- */
        public async Task<SortedDictionary<DateTime, int>> GetCommentsCountByDate(int projectID) {

            // Prvo uzimamo projekat
            var project = await Context.Projects
                .Where(p => p.ProjectID == projectID)
                .Include(p => p.AssignmentLists)
                    .ThenInclude(al => al.Assignments)
                        .ThenInclude(a => a.Comments)
                .FirstOrDefaultAsync();

            if (project == null) {
                Logger.LogInformation($"Project with id : {projectID} not found!");
                throw new ArgumentException($"Project with id : {projectID} not found!");
            }
            else {
                // Komentari po datumu
                var commentsByDate = project.AssignmentLists
                   .SelectMany(al => al.Assignments)
                   .SelectMany(a => a.Comments)
                   .GroupBy(c => c.CreationDate.Date)
                   .ToDictionary(g => g.Key, g => g.Count());

                // Datumi kada nemaju komentari
                var startDate = project.StartDate.Date;
                var endDate = DateTime.Now.Date;
                var currentDate = startDate;

                var sortedCommentsByDate = new SortedDictionary<DateTime, int>();

                while (currentDate <= endDate) {
                    if (commentsByDate.ContainsKey(currentDate)) {
                        sortedCommentsByDate.Add(currentDate, commentsByDate[currentDate]);
                    }
                    else sortedCommentsByDate.Add(currentDate, 0);

                    currentDate = currentDate.AddDays(1);
                }

                return sortedCommentsByDate;
            }
        }

        /* ----------------------------------------------------------   KOMENTARI PO DATUMU I ASSIGNMENT LISTI   ----------------------------------------------------------------- */
        public async Task<SortedDictionary<DateTime, int>> GetCommentsCountByDateAndAssignmentList(int projectID, int assignmentListID) {

            // Prvo uzimamo projekat
            var project = await Context.Projects
                .Where(p => p.AssignmentLists.Any(al => al.AssignmentListID == assignmentListID))
                .Include(p => p.AssignmentLists)
                    .ThenInclude(al => al.Assignments)
                        .ThenInclude(a => a.Comments)
                .FirstOrDefaultAsync();

            if (project == null) {
                Logger.LogInformation($"Project with id : {projectID} not found!");
                throw new ArgumentException($"Project with id : {projectID} not found!");
            }
            else {
                // Komentari po datumu
                var commentsByDate = project.AssignmentLists
                   .Where(al => al.AssignmentListID == assignmentListID)
                   .SelectMany(al => al.Assignments)
                   .SelectMany(a => a.Comments)
                   .GroupBy(c => c.CreationDate.Date)
                   .ToDictionary(g => g.Key, g => g.Count());

                // Datumi kada nemaju komentari
                var startDate = project.StartDate.Date;
                var endDate = DateTime.Now.Date;
                var currentDate = startDate;

                var sortedCommentsByDate = new SortedDictionary<DateTime, int>();

                while (currentDate <= endDate) {
                    if (commentsByDate.ContainsKey(currentDate)) {
                        sortedCommentsByDate.Add(currentDate, commentsByDate[currentDate]);
                    }
                    else sortedCommentsByDate.Add(currentDate, 0);

                    currentDate = currentDate.AddDays(1);
                }

                return sortedCommentsByDate;
            }
        }

        /* ----------------------------------------------------------   USER SA NAJVISE KOMENTARA    ----------------------------------------------------------------- */
        public async Task<UserWithCountDTO> GetUserWithMostComments(int projectId) {
            // Fetch the project with all its comments
            var project = await Context.Projects
                .Where(p => p.ProjectID == projectId)
                .Include(p => p.AssignmentLists)
                    .ThenInclude(al => al.Assignments)
                        .ThenInclude(a => a.Comments)
                            .ThenInclude(c => c.User)
                .FirstOrDefaultAsync();

            Logger.LogInformation($"{project.ProjectName}");
            if (project == null) {
                // Handle project not found
                throw new ArgumentException($"Project with ID {projectId} not found.");
            }

            // Group comments by user ID and count them
            var commentCountsByUser = project.AssignmentLists
                .SelectMany(al => al.Assignments)
                .SelectMany(a => a.Comments)
                .GroupBy(c => c.User.UserID)
                .ToDictionary(g => g.Key, g => g.Count());
            Logger.LogInformation($"{commentCountsByUser}");
            // Find the user with the most comments
            var userWithMostComments = commentCountsByUser.OrderByDescending(kv => kv.Value).FirstOrDefault();

            // Get the user's name
            var user = await Context.Users.FirstOrDefaultAsync(u => u.UserID == userWithMostComments.Key);
            if (user == null) {
                // Handle case when no comments exist
                throw new ArgumentException($"No comments for this project");
            }
            Logger.LogInformation($"{user.UserID}");

            var userWithCommentsDTO = new UserWithCountDTO
            {
                Id = user.UserID,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PictureURL = user.PictureURL,
                Count = userWithMostComments.Value
            };

            // Return the user's name and comment count
            return userWithCommentsDTO;
        }


        public async Task<UserWithCountDTO> GetUserWithMostCommentsByAssignmentList(int projectId, int assignmentListID) {
            // Fetch the project with all its comments
            var project = await Context.Projects
                .Where(p => p.ProjectID == projectId)
                .Include(p => p.AssignmentLists)
                    .ThenInclude(al => al.Assignments)
                        .ThenInclude(a => a.Comments)
                            .ThenInclude(c => c.User)
                .FirstOrDefaultAsync();

            Logger.LogInformation($"{project.ProjectName}");
            if (project == null) {
                // Handle project not found
                throw new ArgumentException($"Project with ID {projectId} not found.");
            }

            // Group comments by user ID and count them
            var commentCountsByUser = project.AssignmentLists
                .Where(al => al.AssignmentListID == assignmentListID)
                .SelectMany(al => al.Assignments)
                .SelectMany(a => a.Comments)
                .GroupBy(c => c.User.UserID)
                .ToDictionary(g => g.Key, g => g.Count());
            Logger.LogInformation($"{commentCountsByUser}");
            // Find the user with the most comments
            var userWithMostComments = commentCountsByUser.OrderByDescending(kv => kv.Value).FirstOrDefault();

            // Get the user's name
            var user = await Context.Users.FirstOrDefaultAsync(u => u.UserID == userWithMostComments.Key);
            if (user == null) {
                // Handle case when no comments exist
                throw new ArgumentException($"No comments for this project");
            }
            Logger.LogInformation($"{user.UserID}");

            var userWithCommentsDTO = new UserWithCountDTO
            {
                Id = user.UserID,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PictureURL = user.PictureURL,
                Count = userWithMostComments.Value
            };

            // Return the user's name and comment count
            return userWithCommentsDTO;
        }

        /* ----------------------------------------------------------   USERI SA BROJEM TASKOVA    ----------------------------------------------------------------- */
        public async Task<List<UserWithCountDTO>> GetUsersWithTaskCounts(int projectID) {
            try {

                // Selekt svih jedinstvenih usera sa projekta
                var users = Context.UserProjects
                    .Where(up => up.ProjectID == projectID)
                    .Select(up => up.UserID)
                    .Distinct()
                    .ToList();

                // Deifinise povratnu promenljivu
                var usersWithCounts = new List<UserWithCountDTO>();

                foreach (var userId in users) {
                    var user = await Context.Users.FindAsync(userId);
                    if (user != null) {
                        var assignmentCount = Context.UserAssignments
                            .Count(ua => ua.UserID == userId &&
                                         ua.Assignment.AssignmentList.ProjectID == projectID && ua.Assignment.Status == "In Progress");

                        var userWithCount = new UserWithCountDTO
                        {
                            Id = user.UserID,
                            Username = user.Username,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            PictureURL = user.PictureURL,
                            Count = assignmentCount
                        };

                        usersWithCounts.Add(userWithCount);
                    }
                }
                return usersWithCounts;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while getting users with task counts: {ex.Message}");
                throw;
            }
        }

        public async Task<List<UserWithCountDTO>> GetUsersWithTaskCountsByAssignmentListID(int projectID, int assignmentListID) {
            try {

                // Selekt svih jedinstvenih usera sa assignmentlisteID
                var users = Context.UserAssignments
                    .Where(up => up.Assignment.AssignmentList.AssignmentListID == assignmentListID )
                    .Select(up => up.UserID)
                    .Distinct()
                    .ToList();

                // Deifinise povratnu promenljivu
                var usersWithCounts = new List<UserWithCountDTO>();

                foreach (var userId in users) {
                    var user = await Context.Users.FindAsync(userId);
                    if (user != null) {
                        var assignmentCount = Context.UserAssignments
                            .Count(ua => ua.UserID == userId &&
                                         ua.Assignment.AssignmentList.ProjectID == projectID && ua.Assignment.AssignmentList.AssignmentListID == assignmentListID && ua.Assignment.Status == "In Progress");

                        var userWithCount = new UserWithCountDTO
                        {
                            Id = user.UserID,
                            Username = user.Username,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            PictureURL = user.PictureURL,
                            Count = assignmentCount
                        };

                        usersWithCounts.Add(userWithCount);
                    }
                }
                return usersWithCounts;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while getting users with task counts: {ex.Message}");
                throw;
            }
        }
        /* ----------------------------------------------------------   USERI SA BROJEM ZAVRSENIH TASKOVA    ----------------------------------------------------------------- */
        public async Task<List<UserWithCountDTO>> GetUsersWithCompletedTaskCounts(int projectID) {
            try {

                // Selekt svih jedinstvenih usera sa projekta
                var users = Context.UserProjects
                    .Where(up => up.ProjectID == projectID)
                    .Select(up => up.UserID)
                    .Distinct()
                    .ToList();

                // Deifinise povratnu promenljivu
                var usersWithCounts = new List<UserWithCountDTO>();

                foreach (var userId in users) {
                    var user = await Context.Users.FindAsync(userId);
                    if (user != null) {
                        var assignmentCount = Context.UserAssignments
                            .Count(ua => ua.UserID == userId &&
                                         ua.Assignment.AssignmentList.ProjectID == projectID &&
                                         ua.Assignment.Status == "Completed");

                        var userWithCount = new UserWithCountDTO
                        {
                            Id = user.UserID,
                            Username = user.Username,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            PictureURL = user.PictureURL,
                            Count = assignmentCount
                        };

                        usersWithCounts.Add(userWithCount);
                    }
                }
                return usersWithCounts;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while getting users with task counts: {ex.Message}");
                throw;
            }
        }
        public async Task<List<UserWithCountDTO>> GetUsersWithCompletedTaskCountsByAssignmentList(int projectID, int assignmentListID) {
            try {

                // Selekt svih jedinstvenih usera sa projekta
                var users = Context.UserAssignments
                    .Where(up => up.Assignment.AssignmentList.AssignmentListID == assignmentListID)
                    .Select(up => up.UserID)
                    .Distinct()
                    .ToList();

                // Deifinise povratnu promenljivu
                var usersWithCounts = new List<UserWithCountDTO>();

                foreach (var userId in users) {
                    var user = await Context.Users.FindAsync(userId);
                    if (user != null) {
                        var assignmentCount = Context.UserAssignments
                            .Count(ua => ua.UserID == userId &&
                                         ua.Assignment.AssignmentList.ProjectID == projectID && ua.Assignment.AssignmentList.AssignmentListID == assignmentListID && 
                                         ua.Assignment.Status == "Completed");

                        var userWithCount = new UserWithCountDTO
                        {
                            Id = user.UserID,
                            Username = user.Username,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            PictureURL = user.PictureURL,
                            Count = assignmentCount
                        };

                        usersWithCounts.Add(userWithCount);
                    }
                }
                return usersWithCounts;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while getting users with task counts: {ex.Message}");
                throw;
            }
        }
        /* ----------------------------------------------------------   UKUPAN BROJ JEDINSTVENIH USERA    ----------------------------------------------------------------- */
        public async Task<int> GetUniqueUserCountForProject(int projectID) {
            try {

                //var uniqueUserCount = await Context.UserAssignments
                //    .Where(ua => ua.Assignment.AssignmentList.ProjectID == projectID)
                //    .Select(ua => ua.UserID)
                //    .Distinct()
                //    .CountAsync();

                var uniqueUserCount = await Context.UserProjects
                    .Where(ua => ua.ProjectID == projectID)
                    .Select(ua => ua.UserID)
                    .Distinct()
                    .CountAsync();

                return uniqueUserCount;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while retrieving unique user count for project {projectID}: {ex.Message}");
                throw;
            }
        }
        public async Task<int> GetUniqueUserCountForProjectAndAssignmentList(int projectID, int assignmentListID) {
            try {
                
                var uniqueUserCount = await Context.UserAssignments
                    .Where(ua => ua.Assignment.AssignmentList.AssignmentListID == assignmentListID)
                    .Select(ua => ua.UserID)
                    .Distinct()
                    .CountAsync();
                
                return uniqueUserCount;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while retrieving unique user count for project {projectID}: {ex.Message}");
                throw;
            }
        }
        /* ----------------------------------------------------------   BROJ HIGH PRIORITY TASKOVA    ----------------------------------------------------------------- */
        public async Task<int> GetHighPriorityTaskCountForProject(int projectID) {
            try {
                var highPriorityTaskCount = await Context.Assignments
                    .Where(a => a.AssignmentList.ProjectID == projectID && a.Priority == "High")
                    .CountAsync();

                return highPriorityTaskCount;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while retrieving high priority task count for project {projectID}: {ex.Message}");
                throw;
            }
        }
        public async Task<int> GetHighPriorityTaskCountForProjectByAssignmentList(int projectID, int assignmentListID) {
            try {
                var highPriorityTaskCount = await Context.Assignments
                    .Where(a => a.AssignmentList.ProjectID == projectID && a.Priority == "High" && a.AssignmentList.AssignmentListID == assignmentListID)
                    .CountAsync();

                return highPriorityTaskCount;
            }
            catch (Exception ex) {
                Logger.LogError($"Error occurred while retrieving high priority task count for project {projectID}: {ex.Message}");
                throw;
            }
        }
        /* ----------------------------------------------------------   PROCENAT ZAVRSENOSTI ( IN PROGRESS / PLANNED )  ----------------------------------------------------------- */
        public async Task<(double inProgressMean, double plannedMean)> CalculateProgressMeans(int projectID) {
            var inProgressTasks = await Context.Assignments
                .Where(a => a.AssignmentList.ProjectID == projectID && a.Status == "In Progress" && a.Progress.HasValue)
                .ToListAsync();

            var plannedTasks = await Context.Assignments
                .Where(a => a.AssignmentList.ProjectID == projectID && a.Status == "Planned" && a.Progress.HasValue)
                .ToListAsync();

            double inProgressMean = inProgressTasks.Any() ? inProgressTasks.Average(a => a.Progress.Value) : 0;
            double plannedMean = plannedTasks.Any() ? plannedTasks.Average(a => a.Progress.Value) : 0;

            return (inProgressMean, plannedMean);
        }
        public async Task<(double inProgressMean, double plannedMean)> CalculateProgressMeansByAssignmentList(int projectID, int assignmentListID) {
            var inProgressTasks = await Context.Assignments
                .Where(a => a.AssignmentList.ProjectID == projectID && a.AssignmentList.AssignmentListID == assignmentListID && a.Status == "In Progress" && a.Progress.HasValue)
                .ToListAsync();

            var plannedTasks = await Context.Assignments
                .Where(a => a.AssignmentList.ProjectID == projectID && a.AssignmentList.AssignmentListID == assignmentListID  && a.Status == "Planned" && a.Progress.HasValue)
                .ToListAsync();

            double inProgressMean = inProgressTasks.Any() ? inProgressTasks.Average(a => a.Progress.Value) : 0;
            double plannedMean = plannedTasks.Any() ? plannedTasks.Average(a => a.Progress.Value) : 0;

            return (inProgressMean, plannedMean);
        }
        /* ----------------------------------------------------------   PROSECAN BROJ SATI ZA USERA PO DANIMA  ----------------------------------------------------------- */
        public async Task<List<Dictionary<int, SortedDictionary<DateTime, double>>>> GetAverageTimeToCompleteTask(int projectID) {

            // Prvo nalazimo projekat
            var project = await Context.Projects
                .Where(p => p.ProjectID == projectID)
                .Include(p => p.AssignmentLists)
                    .ThenInclude(al => al.Assignments)
                .FirstOrDefaultAsync();

            if (project == null) {
                throw new ArgumentException($"Project with ID {projectID} not found.");
            }

            // Svi korisnici na tom projektu
            var users = await Context.UserProjects
                .Where(up => up.ProjectID == projectID)
                .Select(up => up.UserID)
                .ToListAsync();

            var averageTimes = new List<Dictionary<int, SortedDictionary<DateTime, double>>>();

            var startDate = project.StartDate.Date;
            var endDate = DateTime.Now.Date;
            var currentDate = startDate;

            while (currentDate <= endDate) {
                var userAverageTimes = new Dictionary<int, SortedDictionary<DateTime, double>>();

                foreach (var userId in users) {
                    var userAssignments = await Context.UserAssignments
                        .Where(ua => ua.UserID == userId)
                        .Select(ua => ua.AssignmentID)
                        .ToListAsync();

                    var userTaskTimes = new SortedDictionary<DateTime, double>();

                    foreach (var assignmentId in userAssignments) {
                        var assignments = project.AssignmentLists
                            .SelectMany(al => al.Assignments)
                            .Where(a => a.AssignmentID == assignmentId && a.CompletionTime.HasValue)
                            .OrderBy(a => a.CreationDate)
                            .ToList();

                        if (assignments.Any()) {
                            foreach (var assignment in assignments) {
                                if (assignment.CompletionTime.Value.Date == currentDate) {
                                    var taskTime = (assignment.CompletionTime.Value - assignment.CreationDate).TotalHours;
                                    if (userTaskTimes.ContainsKey(currentDate)) {
                                        userTaskTimes[currentDate] += taskTime;
                                    }
                                    else {
                                        userTaskTimes.Add(currentDate, taskTime);
                                    }
                                }
                            }
                        }
                    }

                    if (userTaskTimes.Any()) {
                        userAverageTimes.Add(userId, userTaskTimes);
                    }
                }

                if (userAverageTimes.Any()) {
                    averageTimes.Add(userAverageTimes);
                }

                currentDate = currentDate.AddDays(1);
            }

            return averageTimes;


        }


        /* ------------------------------------------------------- TASK COUNTS BY STATUS ------------------------------------------------------- */
        public async Task<Dictionary<string, int>> GetTaskCountsByStatus(int projectID) {
            var taskCountsByStatus = Context.Assignments
                .Where(a => a.AssignmentList.ProjectID == projectID)
                .GroupBy(a => a.Status)
                .ToDictionary(g => g.Key, g => g.Count());

            var requiredStatuses = new List<string> { "In Progress", "Planned", "Completed", "Dismissed" };

            // Add missing statuses with count 0
            foreach (var status in requiredStatuses) {
                if (!taskCountsByStatus.ContainsKey(status)) {
                    taskCountsByStatus.Add(status, 0);
                }
            }

            return taskCountsByStatus;
        }
        public async Task<Dictionary<string, int>> GetTaskCountsByStatusAndAssignmentList(int projectID, int assignmentListID) {
            var taskCountsByStatus = Context.Assignments
                .Where(a => a.AssignmentList.ProjectID == projectID && a.AssignmentList.AssignmentListID == assignmentListID)
                .GroupBy(a => a.Status)
                .ToDictionary(g => g.Key, g => g.Count());

            var requiredStatuses = new List<string> { "In Progress", "Planned", "Completed", "Dismissed" };

            // Add missing statuses with count 0
            foreach (var status in requiredStatuses) {
                if (!taskCountsByStatus.ContainsKey(status)) {
                    taskCountsByStatus.Add(status, 0);
                }
            }

            return taskCountsByStatus;
        }



    }
}
