using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.TimeRegion;
using PlanIT.Logging;
using PlanIT.Services.Interface;

namespace PlanIT.API.Controllers {
    [Route("api/timeRegion")]
    [ApiController]
    public class TimeRegionController : ControllerBase {
        public ITimeRegionServices timeRegionService { get; }
        private readonly ILoggger loggger;
        public TimeRegionController(ILoggger loger, ITimeRegionServices aLogic) {
            loggger = loger;
            timeRegionService = aLogic;
        }


        [HttpGet]
        public async Task<List<GetTimeRegionDTO>> GetTimeRegions() {
            loggger.LogInformation($"Called {nameof(GetTimeRegions)} from TimeRegionController");
            var timeRegion = await timeRegionService.GetAllTimeRegionsAsync();

            return timeRegion.Select(TimeRegionMapper.ToDto).ToList();
        }

        [HttpGet("{timeRegionID}")]
        public async Task<GetTimeRegionDTO?> Get(int timeRegionID) {
            loggger.LogInformation($"Called {nameof(Get)} from TimeRegionController");
            var timeRegion = await timeRegionService.GetTimeRegionByID(timeRegionID);

            return timeRegion?.ToDto();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateTimeRegionDTO createTimeRegionDTO) {
            loggger.LogInformation($"Called {nameof(CreateTimeRegionDTO)} from TimeRegionController");

            try {
                await timeRegionService.AddTimeRegionAsync(createTimeRegionDTO.FromDto());
                return Ok(new { Message = "TimeRegion added successfully" });
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete("{timeRegionID}")]
        public async Task Delete(int timeRegionID) {
            loggger.LogInformation($"Called {nameof(Delete)} from TimeRegionController");
            await timeRegionService.DeleteTimeRegionAsync(timeRegionID);
        }

        [HttpPut("{timeRegionID}")]
        public async Task Put(int timeRegionID, [FromBody] UpdateTimeRegionDTO updateTimeRegionDTO) {
            loggger.LogInformation($"Called {nameof(UpdateTimeRegionDTO)} from TimeRegionController");
            await timeRegionService.UpdateTimeRegionAsync(updateTimeRegionDTO.FromDto(), timeRegionID);

        }
    }
}
