using PlanIT.Services.Interface;
using PlanIT.Logging;
using PlanIT.DataAccessLayer;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace PlanIT.Services.Logic
{
    public class TimeRegionServices : ITimeRegionServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }

        public TimeRegionServices(ApplicationDbContext context, ILoggger loger) {
            Logger = loger;
            Context = context;
        }


        public async Task<List<TimeRegion>> GetAllTimeRegionsAsync() {
            Logger.LogInformation($"Called: {nameof(GetAllTimeRegionsAsync)} from TimeRegionServices");
            try {
                return await Context.TimeRegions.ToListAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAllTimeRegionsAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task DeleteTimeRegionAsync(int TimeRegionID) {
            Logger.LogInformation($"Called: {nameof(DeleteTimeRegionAsync)} from TimeRegionServices");
            try {
                var existingTimeRegion = await Context.TimeRegions.FirstOrDefaultAsync(x => x.TimeRegionId == TimeRegionID);

                if (existingTimeRegion == null)
                    return;

                Context.TimeRegions.Remove(existingTimeRegion);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(DeleteTimeRegionAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<TimeRegion> GetTimeRegionByID(int TimeRegionID) {
            Logger.LogInformation($"Called: {nameof(GetTimeRegionByID)} with TimeRegionID: {TimeRegionID} from TimeRegionServices");
            try {
                return await Context.TimeRegions.FirstOrDefaultAsync(x => x.TimeRegionId == TimeRegionID) ?? throw new Exception("Assignment not found");
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetTimeRegionByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task UpdateTimeRegionAsync(TimeRegion timeRegion, int TimeRegionID) {
            Logger.LogInformation($"Called: {nameof(UpdateTimeRegionAsync)} from TimeRegionServices");

            try {
                var existingTimeRegion = await Context.TimeRegions.FirstOrDefaultAsync(x => x.TimeRegionId == TimeRegionID);
                if (existingTimeRegion == null)
                    return;

                existingTimeRegion.TimeRegionName = timeRegion.TimeRegionName;

                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(UpdateTimeRegionAsync)}: {ex.Message}");
                throw;
            }

        }
        public async Task AddTimeRegionAsync(TimeRegion timeRegion) {
            Logger.LogInformation($"Called: {nameof(AddTimeRegionAsync)} from TimeRegionServices");
            try {
                Context.TimeRegions.Add(timeRegion);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(AddTimeRegionAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}
