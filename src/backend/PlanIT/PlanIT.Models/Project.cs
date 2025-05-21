using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class Project
    {
        [Key]
        public int ProjectID { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ProjectLeaderID { get; set; }  
        public User ProjectLeader { get; set; }
        public List<AssignmentList> AssignmentLists { get; set; }
        public List<User_Project> UserProjects { get; set; }
        public List<KanbanColumn> KanbanColumns { get; set;}

    }
}