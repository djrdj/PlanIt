using Microsoft.AspNetCore.Authorization;
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
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    [Authorize]
    public class NotificationHub : Hub<INotificationHub>
    {
        public ILoggger Logger { get; }
        public readonly IDictionary<string, HashSet<string>> _userConnections = new Dictionary<string, HashSet<string>>();
        private readonly ApplicationDbContext _context;
        public NotificationHub(ApplicationDbContext context, ILoggger loggger)
        {
            _context = context;
            Logger = loggger;
        }
        public override async Task OnConnectedAsync()
        {
            Logger.LogInformation($"Called: {nameof(OnConnectedAsync)} from NotificationHub");

            try
            {
                var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);
                var httpContext = Context.GetHttpContext();
                int userId = Convert.ToInt32(userIdClaim.Value);

                await Groups.AddToGroupAsync(Context.ConnectionId, Context.UserIdentifier);
                var notifications = await _context.Notifications.Where(x => x.UserID == userId && x.Read == false).ToListAsync();

                Logger.LogInformation($"{notifications}");
                
                if (!_userConnections.ContainsKey(userId.ToString()))
                {

                    _userConnections[userId.ToString()] = new HashSet<string>();

                }
                _userConnections[userId.ToString()].Add(Context.ConnectionId);

                if (notifications.Count > 0) await Clients.Group(userId.ToString()).newNotifications();
                //await Clients.All.newNotifications(); ;

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(OnConnectedAsync)}: {ex.Message}");
                throw;
            }


        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                connections.Remove(Context.ConnectionId);
                if (connections.Count == 0)
                {
                    _userConnections.Remove(userId.ToString());
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task invokeGetNotifications()
        {
            var userId = Context.UserIdentifier;

            var notifications = await _context.Notifications
            .Where(x => x.UserID.ToString() == userId && x.Read == false)
            .OrderByDescending(x => x.TimeStamp)
            .Select(notification => new NotificationDTO
            {
                NotificationID = notification.NotificationID,
                UserID = notification.UserID,
                TimeStamp = notification.TimeStamp,
                NotificationType = notification.Type,
                SenderID = notification.SenderID,
                Read = notification.Read
            })
            .Take(3)
            .ToListAsync();
            await Clients.Caller.recieveNotifications(notifications);
        }
        public async Task invokeGetAllNotifications()
        {
            var userId = Context.UserIdentifier;

            var notifications = await _context.Notifications
            .Where(x => x.UserID.ToString() == userId)
            .OrderByDescending(x => x.TimeStamp)
            .Select(notification => new NotificationDTO
            {
                NotificationID = notification.NotificationID,
                UserID = notification.UserID,
                TimeStamp = notification.TimeStamp,
                NotificationType = notification.Type,
                SenderID = notification.SenderID,
                Read = notification.Read
            })
            .ToListAsync();

            await Clients.Caller.recieveAllNotifications(notifications);
        }

        public async Task readNotifications(List<int> notifications)
        {
            foreach (int i in notifications)
            {
                var _notif = await _context.Notifications.FirstOrDefaultAsync(x => x.NotificationID == i);
                _notif.Read = true;
                await _context.SaveChangesAsync();
            }
        }
    }
}

