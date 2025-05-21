using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IKanbanColumnServices
    {
        Task<List<KanbanColumn>> GetAllKanbanColumnsAsync();
        Task<List<KanbanColumn>> GetKanbanColumnsByUserIdAndProjectIdAsync(int userId, int projectId);
        Task<List<KanbanColumn>> GetKanbanColumnsByUserIdSortedByIndexAsync(int userId);
        Task AddKanbanColumnAsync(KanbanColumn kanbanColumn);
        Task DeleteKanbanColumnAsync(KanbanColumn kanbanColumn);
        Task UpdateKanbanColumnAsync(KanbanColumn kanbanColumn, int index);
    }
}
