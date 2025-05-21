using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface INotificationServices
    {
        public Task TriggerCommentNotification(int task_id, int sender_id, NotificationType type);


        Task TriggerTaskNotificationForUpdate(int task_id, List<int> niz, int senderId);
        Task TriggerTaskNotificationForDelete(int task_id, int senderId);
        Task TriggerTaskNotificationForDeleteArray(int task_id, List<int> niz, int senderId);


        Task TriggerProjectNotificationForUpdate(int project_id, List<int> niz, int senderId);
        Task TriggerProjectNotificationForDeleteArray(int project_id, List<int> niz, int senderId);
        Task TriggerProjectNotificationForDelete(int project_id, int senderId);

    }
}
