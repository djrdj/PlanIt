using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Project
{
    public class GetProjectDetailsDTO
    {
        public int ProjectID { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ProjectLeaderID { get; set; }
        public string ProjectLeaderFirstName { get; set; }
        public string ProjectLeaderLastName { get; set; }
        public string ProjectLeaderURL { get; set; }
    }
}
