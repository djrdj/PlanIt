using PlanIT.DataTransferModel.TimeRegion;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class TimeRegionMapper
    {
        public static GetTimeRegionDTO ToDto(this TimeRegion timeRegion) => new()
        {
            TimeRegionId = timeRegion.TimeRegionId,
            TimeRegionName = timeRegion.TimeRegionName
        };

        public static TimeRegion FromDto(this CreateTimeRegionDTO dto) => new()
        {
            TimeRegionName = dto.TimeRegionName
        };
        public static TimeRegion FromDto(this UpdateTimeRegionDTO dto) => new()
        {
            TimeRegionName = dto.TimeRegionName
        };
    }
}
