using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class Assignment
    {
        [Key]
        public int AssignmentID { get; set; }
        public string AssignmentName { get; set; }
        public int? AssignmentLeadID { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime Deadline { get; set; }
        public DateTime? CompletionTime { get; set; }
        public int? ParentAssignmentID { get; set; }
        public int AssignmentListID { get; set; }
        public int? Progress { get; set; }
        public User AssignmentLeader { get; set; }
        public AssignmentList AssignmentList { get; set; }
        public List<Comment> Comments { get; set; }
        public List<User_Assignment> UserAssignments { get; set; }

    }
}
