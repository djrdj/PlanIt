using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class UpdateUserDTO
    {
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PictureURL { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public int? TimeRegionID { get; set; }
        public int? UserRoleID { get; set; }
    }
}
