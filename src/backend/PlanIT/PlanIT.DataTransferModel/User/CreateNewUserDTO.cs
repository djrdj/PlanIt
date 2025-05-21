using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class CreateNewUserDTO
    {
        public string? Token { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public int Day { get; set; }
        public string Month { get; set; }
        public int Year { get; set; }
        public int TimeRegionID { get; set; }
        public int UserRoleID {  get; set; }
    }
}
