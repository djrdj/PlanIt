using PlanIT.DataTransferModel.KanbanColumn;
using PlanIT.DataTransferModel.ProjectRole;
using PlanIT.Models;

namespace PlanIT.Mappers
{
    public static class KanbanColumnMapper
    {
        public static GetKanbanColumnDTO ToDto(this KanbanColumn kanbanColumn) => new()
        {
            ProjectID = kanbanColumn.ProjectID,
            UserID = kanbanColumn.UserID,
            Status = kanbanColumn.Status,
            Index = kanbanColumn.Index,
        };

        public static KanbanColumn FromDto(this CreateKanbanColumnDTO dto) => new()
        {
            UserID = (int)dto.UserID,
            ProjectID = (int)dto.ProjectID,
            Status = dto.Status,
            Index = (int)dto.Index
        };
        public static KanbanColumn FromDto(this UpdateKanbanColumn dto) => new()
        {
            Index = (int)dto.Index
        };
    }
}
