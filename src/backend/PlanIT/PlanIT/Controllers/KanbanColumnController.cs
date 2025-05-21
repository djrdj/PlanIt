using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.KanbanColumn;
using PlanIT.DataTransferModel.ProjectRole;
using PlanIT.DataTransferModel.User_Project;
using PlanIT.Logging;
using PlanIT.Mappers;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;

namespace PlanIT.Controllers
{
    [Route("api/kanbanController")]
    [ApiController]
    public class KanbanColumnController : ControllerBase
    {
        public IKanbanColumnServices kanbanColumnServices { get; }
        private readonly ILoggger loggger;
        public KanbanColumnController(ILoggger loger, IKanbanColumnServices aLogic)
        {
            loggger = loger;
            kanbanColumnServices = aLogic;
        }

        [HttpGet]
        public async Task<List<GetKanbanColumnDTO>> GetKanbanColumns()
        {
            loggger.LogInformation($"Called {nameof(GetKanbanColumns)} from KanbanController");
            var kanbanColumn = await kanbanColumnServices.GetAllKanbanColumnsAsync();

            return kanbanColumn.Select(KanbanColumnMapper.ToDto).ToList();

        }

        [HttpPost]
        public async Task<IActionResult> createKanbanColumn([FromBody] CreateKanbanColumnDTO kanbanColumn)
        {
            loggger.LogInformation($"Called {nameof(createKanbanColumn)} from KanbanController");

            try
            {
                await kanbanColumnServices.AddKanbanColumnAsync(kanbanColumn.FromDto());
                return Ok(new { Message = "KanbanColumn added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(createKanbanColumn)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete]
        public async Task<IActionResult> DeleteKanbanColums(int projectID, string status)
        {
            loggger.LogInformation($"Called {nameof(DeleteKanbanColums)} from KanbanController");
            try
            {
                KanbanColumn kc = new KanbanColumn();
                kc.ProjectID = projectID;
                kc.Status = status;
                await kanbanColumnServices.DeleteKanbanColumnAsync(kc);
                return Ok(new { Message = "KanbanColumn deleted successfully" });

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(DeleteKanbanColums)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateKanbanColumn(int projectID, int userID, string status, [FromBody] int index)
        {
            loggger.LogInformation($"Called {nameof(UpdateKanbanColumn)} from KanbanController");

            try
            {
                var kanbanColumn = new KanbanColumn
                {
                    ProjectID = projectID,
                    UserID = userID,
                    Status = status
                };

                await kanbanColumnServices.UpdateKanbanColumnAsync(kanbanColumn, index);
                return Ok(new { Message = "KanbanColumn updated successfully" });

            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(UpdateKanbanColumn)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetKanbanColumnsByUserId(int userId) {
            loggger.LogInformation($"Called {nameof(GetKanbanColumnsByUserId)} from KanbanController");
            try {
                var kanbanColumns = await kanbanColumnServices.GetKanbanColumnsByUserIdSortedByIndexAsync(userId);
                return Ok(kanbanColumns.Select(KanbanColumnMapper.ToDto).ToList());
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(GetKanbanColumnsByUserId)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [HttpGet("{userId}/{projectId}")]
        public async Task<IActionResult> GetKanbanColumnsByUserIdAndProjectId(int userId, int projectId) {
            loggger.LogInformation($"Called {nameof(GetKanbanColumnsByUserIdAndProjectId)} from KanbanController");
            try {
                var kanbanColumns = await kanbanColumnServices.GetKanbanColumnsByUserIdAndProjectIdAsync(userId, projectId);
                return Ok(kanbanColumns.Select(KanbanColumnMapper.ToDto).ToList());
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(GetKanbanColumnsByUserIdAndProjectId)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

    }
}
