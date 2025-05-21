using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class User_Project
    {
        public int UserID { get; set; }
        public int ProjectID { get; set; }

        public User User { get; set; }
        public Project Project { get; set; }

    }
}
