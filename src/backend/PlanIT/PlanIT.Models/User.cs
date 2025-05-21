using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string PictureURL { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int TimeRegionID { get; set; }
        public int Activated {  get; set; }
        public TimeRegion TimeRegion { get; set; }
        public int UserRoleID { get; set; }
        public int DarkTheme { get; set; }
        public string Language { get; set; }
        public int PushEmailSettings { get; set; }
        public int PushNotificationSettings { get; set; }
        public UserRole UserRole { get; set; }
        public List<User_Project> UserProjects { get; set; }
        public List<KanbanColumn> KanbanColumns { get; set; }
        public List<User_Assignment> UserAssignments { get; set; }
        public List<Comment> Comments { get; set; }
        public List<Notification> Notifications { get; set; }
        public List<Assignment> AssignmentLeads { get; set; }
        public List<Project> ProjectLeads { get; set; }
    }
}
