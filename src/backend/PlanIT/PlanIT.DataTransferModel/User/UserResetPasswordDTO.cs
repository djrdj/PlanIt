using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class UserResetPasswordDTO
    {
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
    }
}
