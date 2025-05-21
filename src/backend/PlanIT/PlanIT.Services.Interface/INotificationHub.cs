using PlanIT.DataTransferModel.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface INotificationHub
    {
        Task Notify(NotificationDTO notification);
        Task newNotifications();
        Task recieveNotifications(List<NotificationDTO> notifications);
        Task InvokeGetNotifications();
        Task InvokeGetAllNotifications();
        Task recieveAllNotifications(List<NotificationDTO> notifications);
        Task readNotifications(List<int> notifications);
    }
}
