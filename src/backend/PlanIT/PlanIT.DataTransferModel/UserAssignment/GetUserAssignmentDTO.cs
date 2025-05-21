using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.UserAssignment {
    public class GetUserAssignmentDTO {
        public int UserID { get; set; }
        public int AssignmentID { get; set; }
        public int Type { get; set; }
    }
}
