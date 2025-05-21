using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class AssignmentList
    {
        [Key]
        public int AssignmentListID { get; set; }
        public string AssignmentListName { get; set; }
        public string Description { get; set; }
        public int ProjectID { get; set; }
        public Project Project { get; set; }
        public List<Assignment> Assignments { get; set; }

    }
}
