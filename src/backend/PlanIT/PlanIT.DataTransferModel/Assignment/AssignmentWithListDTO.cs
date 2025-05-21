using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Assignment
{
    public class AssignmentWithListDTO
    {
        public int? AssignmentID { get; set; }
        public string? AssignmentName { get; set; }
        public int? AssignmentLeadID { get; set; }
        public string? AssignmentLeadURL { get; set; }
        public string AssignmentLeadFirstName { get; set; }
        public string AssignmentLeadLastName { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public int? Progress {  get; set; }
        public DateTime? CreationDate { get; set; }
        public DateTime? Deadline { get; set; }
        public int? AssignmentListID { get; set; }
        public string? AssignmentListName { get; set; }
        public int? ParentAssignmentID { get; set; }
    }
}
