using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.AssignmentList
{
    public class GetAssignmentListDTO
    {
        public int? AssignmentListID { get; set; }
        public string? AssignmentListName { get; set; }
        public string? Description { get; set; }
        public DateTime? CreationDate { get; set; }
        public int? ProjectID { get; set; }
    }
}
