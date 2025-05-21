using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface ITimeRegionServices
    {
        Task<List<TimeRegion>> GetAllTimeRegionsAsync();
        Task<TimeRegion> GetTimeRegionByID(int TimeRegionID);
        Task AddTimeRegionAsync(TimeRegion timeRegion);
        Task DeleteTimeRegionAsync(int TimeRegionID);
        Task UpdateTimeRegionAsync(TimeRegion timeRegion, int TimeRegionID);
    }
}
