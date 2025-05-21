using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Project
{
    public class UpdateProjectDTO
    {
        public string? ProjectName { get; set; }
        public string? Description { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? EmployeeIdsToAdd { get; set; }
        public List<int>? EmployeeIdsToRemove { get; set; }


    }
}