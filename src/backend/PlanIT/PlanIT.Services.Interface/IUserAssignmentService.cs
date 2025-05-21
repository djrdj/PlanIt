using PlanIT.DataTransferModel.UserAssignment;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IUserAssignmentService
    {
        Task<List<User_Assignment>> GetAllUserAssignmentsAsync();
    }
}
