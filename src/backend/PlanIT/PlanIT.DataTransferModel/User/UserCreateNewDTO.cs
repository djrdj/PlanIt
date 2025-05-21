using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class UserCreateNewDTO
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public int UserRoleID {  get; set; }
    }
}
