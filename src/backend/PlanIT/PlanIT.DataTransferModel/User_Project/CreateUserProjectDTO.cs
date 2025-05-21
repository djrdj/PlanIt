using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User_Project {
    public class CreateUserProjectDTO {
        public int UserID { get; set; }
        public int ProjectID { get; set; }
        public int? ProjectRoleID { get; set; }

    }
}
