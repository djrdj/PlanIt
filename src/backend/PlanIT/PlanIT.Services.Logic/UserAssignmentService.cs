using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.UserAssignment;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    public class UserAssignmentService : IUserAssignmentService
    {

        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public UserAssignmentService(ApplicationDbContext mContext, ILoggger loger)
        {
            Logger = loger;
            Context = mContext;
        }
        public async Task<List<User_Assignment>> GetAllUserAssignmentsAsync()
        {
            Logger.LogInformation($"Called: {nameof(GetAllUserAssignmentsAsync)} from UserAssignmentServices");
            try
            {
                return await Context.UserAssignments.ToListAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAllUserAssignmentsAsync)}: {ex.Message}");
                throw;
            }
        }

    }
}
