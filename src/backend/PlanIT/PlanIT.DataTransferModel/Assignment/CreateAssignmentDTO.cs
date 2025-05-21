using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Assignment
{
    public class CreateAssignmentDTO
    {
        public string? AssignmentName { get; set; }
        public int? AssignmentLeadID { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? Deadline { get; set; }
        public int? AssignmentListID { get; set; }
        public int ParentAssignmentID { get; set; }
        public List<int>? EmployeeIds { get; set; }

    }
}
