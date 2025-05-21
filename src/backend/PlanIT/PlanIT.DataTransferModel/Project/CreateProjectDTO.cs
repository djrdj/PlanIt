using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Project
{
    public class CreateProjectDTO
    {
        public string? ProjectName { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ProjectLeaderID { get; set; }
        public List<int>? EmployeeIds { get; set; } 

    }
}