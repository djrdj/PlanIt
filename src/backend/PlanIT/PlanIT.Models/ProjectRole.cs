using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class ProjectRole
    {
        [Key]
        public int ProjectRoleID { get; set; }
        public string ProjectRoleName { get; set; }
    }
}
