using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace PlanIT.DataTransferModel.Notification
{

    public class NotificationDTO
    {
        public int NotificationID { get; set; }
        public int UserID { get; set; }
        public DateTime TimeStamp { get; set; }
        public NotificationType NotificationType { get; set; }
        public int SenderID { get; set; }
        public bool Read { get; set; }
        public int? AssignmentId { get; set; }
        public int? ProjectId { get; set; }

    }
}
