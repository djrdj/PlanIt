using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IClockifyService
    {
        Task<List<TimeEntry>> GetUserTimeEntriesAsync(string workspaceId, int userId, int projectId);
    }
}
