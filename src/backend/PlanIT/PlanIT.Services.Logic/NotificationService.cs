using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.Notification;
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
    public class NotificationService : INotificationServices
    {
        public ILoggger Logger { get; }
        private readonly IHubContext<NotificationHub, INotificationHub> _hubContext;
        private readonly ApplicationDbContext Context;
        public NotificationService(IHubContext<NotificationHub, INotificationHub> hubContext, ApplicationDbContext context, ILoggger loggger)
        {
            _hubContext = hubContext;
            Context = context;
            Logger = loggger;
        }

        // COMMENT

        public async Task TriggerCommentNotification(int assignmentID, int sender_id, NotificationType type)
        {

            Logger.LogInformation($"Called: {nameof(TriggerCommentNotification)} from NotificationService");

            try
            {
                var Users = await GetUsersForTaskNotification(assignmentID);
                var sender = await Context.Users.FirstOrDefaultAsync(x => x.UserID == sender_id);
                var task = await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == assignmentID);
                Users.Remove(sender_id);
                for (int i = 0; i < Users.Count; i++)
                {
                    Notification notification = new Notification
                    {
                        UserID = Users[i],
                        Description = "",
                        Status = 0,
                        SenderID = sender_id,
                        Type = type,//1 attachment, 2 comment, 3 novi task, 4 novi projekat
                        TimeStamp = DateTime.Now,
                        Read = false
                    };
                    Context.Notifications.Add(notification);
                    await _hubContext.Clients.Group(Users[i].ToString())
                        .Notify(
                             new NotificationDTO
                             {
                                 NotificationID = notification.NotificationID,
                                 UserID = notification.UserID,
                                 TimeStamp = notification.TimeStamp,
                                 SenderID = notification.SenderID,
                                 NotificationType = notification.Type,
                                 Read = notification.Read
                             });
                    await Context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(TriggerCommentNotification)}: {ex.Message}");
                throw;
            }

        }

        // ASSIGNMENT
        
        public async Task TriggerTaskNotificationForUpdate(int task_id, List<int> l, int sender)
        {
            var task = await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == task_id);
            if (task == null) throw new Exception("Task not found");
            if (l == null) throw new Exception("Array is empty");

            var userAssignments = await Context.UserAssignments
                                               .Where(ua => ua.AssignmentID == task_id)
                                               .Include(ua => ua.User)
                                               .ToListAsync();

            if (!userAssignments.Any()) throw new Exception("No users assigned to this task");

            var notifications = new List<Notification>();

            foreach (var userAssignment in l)
            {

                var notification = new Notification
                {
                    UserID = userAssignment,
                    AssignmentId = task_id,
                    Type = NotificationType.TaskAssignment,
                    TimeStamp = DateTime.Now,
                    Read = false,
                    Description = "",
                    Status = 0,
                    SenderID = sender
                };

                notifications.Add(notification);
                await _hubContext.Clients.Group(userAssignment.ToString()).Notify(
                    new NotificationDTO
                    {
                        AssignmentId = notification.AssignmentId,
                        ProjectId = notification.ProjectId,
                        SenderID = notification.SenderID,
                        TimeStamp = notification.TimeStamp,
                        NotificationType = notification.Type,
                        Read = notification.Read,
                        NotificationID = notification.NotificationID,
                        UserID = notification.UserID
                    }
                );
            }
            await Context.Notifications.AddRangeAsync(notifications);
            await Context.SaveChangesAsync();
        }
        public async Task TriggerTaskNotificationForDeleteArray(int task_id, List<int> l, int sender)
        {
            var task = await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == task_id);
            if (task == null) throw new Exception("Task not found");
            if (l == null) throw new Exception("Array is empty");

            var userAssignments = await Context.UserAssignments
                                               .Where(ua => ua.AssignmentID == task_id)
                                               .Include(ua => ua.User)
                                               .ToListAsync();

            if (!userAssignments.Any()) throw new Exception("No users assigned to this task");

            var notifications = new List<Notification>();

            foreach (var userAssignment in l)
            {

                var notification = new Notification
                {
                    UserID = userAssignment,
                    AssignmentId = task_id,
                    Type = NotificationType.RemovedFromAssignment,
                    TimeStamp = DateTime.Now,
                    Read = false,
                    Description = "",
                    Status = 0,
                    SenderID = sender
                };

                notifications.Add(notification);
                await _hubContext.Clients.Group(userAssignment.ToString()).Notify(
                    new NotificationDTO
                    {
                        AssignmentId = notification.AssignmentId,
                        ProjectId = notification.ProjectId,
                        SenderID = notification.SenderID,
                        TimeStamp = notification.TimeStamp,
                        NotificationType = notification.Type,
                        Read = notification.Read,
                        NotificationID = notification.NotificationID,
                        UserID = notification.UserID
                    }
                );
            }
            await Context.Notifications.AddRangeAsync(notifications);
            await Context.SaveChangesAsync();
        }
        public async Task TriggerTaskNotificationForDelete(int task_id, int senderId)
        {
            var task = await Context.Assignments.FirstOrDefaultAsync(x => x.AssignmentID == task_id);
            if (task == null) throw new Exception("Task not found");

            var userAssignments = await Context.UserAssignments
                                               .Where(ua => ua.AssignmentID == task_id)
                                               .Include(ua => ua.User)
                                               .ToListAsync();

            if (!userAssignments.Any()) throw new Exception("No users assigned to this task");

            var notifications = new List<Notification>();

            foreach (var userAssignment in userAssignments)
            {
                var receiver = userAssignment.User; //MOGUCA GRESKA
                var notification = new Notification
                {
                    UserID = receiver.UserID,
                    AssignmentId = task.AssignmentID,
                    Type = NotificationType.TaskAssignment,
                    TimeStamp = DateTime.Now,
                    Read = false,
                    Description = "",
                    Status = 0,
                    SenderID = senderId
                };

                notifications.Add(notification);
                await _hubContext.Clients.Group(receiver.UserID.ToString()).Notify(
                    new NotificationDTO
                    {
                        AssignmentId = notification.AssignmentId,
                        ProjectId = notification.ProjectId,
                        SenderID = notification.SenderID,
                        TimeStamp = notification.TimeStamp,
                        NotificationType = notification.Type,
                        Read = notification.Read
                    }
                );
            }
            await Context.Notifications.AddRangeAsync(notifications);
            await Context.SaveChangesAsync();
        }

        // PROJECT

        public async Task TriggerProjectNotificationForUpdate(int project_id, List<int> niz, int senderId)
        {
            var project = await Context.Projects.FirstOrDefaultAsync(x => x.ProjectID == project_id);
            if (project == null) throw new Exception("Task not found");

            var userProjects = await Context.UserProjects
                                               .Where(ua => ua.ProjectID == project_id)
                                               .Include(ua => ua.User)
                                               .ToListAsync();

            if (!userProjects.Any()) throw new Exception("No users assigned to this task");

            var notifications = new List<Notification>();

            foreach (var userAssignment in userProjects)
            {
                var receiver = userAssignment.User; //MOGUCA GRESKA
                var notification = new Notification
                {
                    UserID = receiver.UserID,
                    ProjectId = project.ProjectID,
                    Type = NotificationType.ProjectAssignment,
                    TimeStamp = DateTime.Now,
                    Read = false,
                    Description = "",
                    Status = 0,
                    SenderID = senderId
                };

                notifications.Add(notification);
                await _hubContext.Clients.Group(receiver.UserID.ToString()).Notify(
                    new NotificationDTO
                    {
                        AssignmentId = notification.AssignmentId,
                        ProjectId = notification.ProjectId,
                        SenderID = notification.SenderID,
                        TimeStamp = notification.TimeStamp,
                        NotificationType = notification.Type,
                        Read = notification.Read
                    }
                );
            }
            await Context.Notifications.AddRangeAsync(notifications);
            await Context.SaveChangesAsync();
        }
        public async Task TriggerProjectNotificationForDeleteArray(int project_id, List<int> niz, int senderId)
        {
            var project = await Context.Projects.FirstOrDefaultAsync(x => x.ProjectID == project_id);
            if (project == null) throw new Exception("Project not found");
            if (niz == null) throw new Exception("Array is empty");

            var userProjects = await Context.UserProjects
                                               .Where(ua => ua.ProjectID == project_id)
                                               .Include(ua => ua.User)
                                               .ToListAsync();

            if (!userProjects.Any()) throw new Exception("No users on this project");

            var notifications = new List<Notification>();

            foreach (var userProject in niz)
            {
                var notification = new Notification
                {
                    UserID = userProject,
                    ProjectId = project_id,
                    Type = NotificationType.RemovedFromProject,
                    TimeStamp = DateTime.Now,
                    Read = false,
                    Description = "",
                    Status = 0,
                    SenderID = senderId
                };

                notifications.Add(notification);
                await _hubContext.Clients.Group(userProject.ToString()).Notify(
                    new NotificationDTO
                    {
                        AssignmentId = notification.AssignmentId,
                        ProjectId = notification.ProjectId,
                        SenderID = notification.SenderID,
                        TimeStamp = notification.TimeStamp,
                        NotificationType = notification.Type,
                        Read = notification.Read,
                        NotificationID = notification.NotificationID,
                        UserID = notification.UserID
                    }
                );
            }
            await Context.Notifications.AddRangeAsync(notifications);
            await Context.SaveChangesAsync();
        }
        public async Task TriggerProjectNotificationForDelete(int project_id, int senderId)
        {
            var project = await Context.Projects.FirstOrDefaultAsync(x => x.ProjectID == project_id);
            if (project == null) throw new Exception("Project not found");

            var userProjects = await Context.UserProjects
                                               .Where(ua => ua.ProjectID == project_id)
                                               .Include(ua => ua.User)
                                               .ToListAsync();

            if (!userProjects.Any()) throw new Exception("No users on this project");

            var notifications = new List<Notification>();

            foreach (var userProject in userProjects)
            {
                var notification = new Notification
                {
                    UserID = userProject.UserID,
                    ProjectId = project_id,
                    Type = NotificationType.RemovedFromProject,
                    TimeStamp = DateTime.Now,
                    Read = false,
                    Description = "",
                    Status = 0,
                    SenderID = senderId
                };

                notifications.Add(notification);
                await _hubContext.Clients.Group(userProject.UserID.ToString()).Notify(
                    new NotificationDTO
                    {
                        AssignmentId = notification.AssignmentId,
                        ProjectId = notification.ProjectId,
                        SenderID = notification.SenderID,
                        TimeStamp = notification.TimeStamp,
                        NotificationType = notification.Type,
                        Read = notification.Read,
                        NotificationID = notification.NotificationID,
                        UserID = notification.UserID
                    }
                );
            }
            await Context.Notifications.AddRangeAsync(notifications);
            await Context.SaveChangesAsync();
        }


        public async Task<List<int>> GetUsersForTaskNotification(int assignmentID)
        {
            var users = await Context.UserAssignments
             .Where(ua => ua.AssignmentID == assignmentID)
             .Select(ua => ua.UserID)
             .ToListAsync();

            return users;
        }


    }
}
