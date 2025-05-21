using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public enum NotificationType
    {
        Attachment,
        Comment,
        TaskAssignment,
        ProjectAssignment,
        RemovedFromProject,
        RemovedFromAssignment,
    }
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }
        public int UserID { get; set; }
        public string Description { get; set; }
        public int Status { get; set; }
        public DateTime TimeStamp { get; set; }
        public User User { get; set; }
        public NotificationType Type { get; set; }
        public int SenderID { get; set; }
        public bool Read { get; set; }
        public int? AssignmentId { get; set; }
        public int? ProjectId { get; set; }
    }
}
