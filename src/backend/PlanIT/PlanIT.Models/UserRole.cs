using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class UserRole
    {
        [Key]
        public int UserRoleID { get; set; }
        public string UserRoleName { get; set; }
    }
}
