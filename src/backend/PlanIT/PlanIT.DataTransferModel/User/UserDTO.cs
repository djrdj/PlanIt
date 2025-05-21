using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class UserDTO
    {
        public int? Id { get; set; }
        public string? Username { get; set; }
        public string? Token { get; set; }
        public string? PictureUrl { get; set; }
        public string? UserRoleName { get; set; }
    }
}
