using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class GetUserDTO
    {
        public int? UserID { get; set; }
        public string? Username { get; set; }
        public string? Token { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PictureUrl { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public int? Activated { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? TimeRegionID { get; set; }
        public int? UserRoleID { get; set; }
        public int? DarkTheme { get; set; }
        public string? Language { get; set; }
        public int? PushEmailSettings { get; set; }
        public int? PushNotificationSettings { get; set; }
    }
}
