
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class User_Assignment
    {
        public int UserID { get; set; }
        public int AssignmentID { get; set; }
        public int Type { get; set; }

        public User User { get; set; }
        public Assignment Assignment { get; set; }
    }
}
