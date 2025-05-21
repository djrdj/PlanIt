using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using PlanIT.DataAccessLayer;
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
    public class KanbanColumnServices : IKanbanColumnServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public KanbanColumnServices(ApplicationDbContext context, ILoggger loger)
        {
            Logger = loger;
            Context = context;
        }
        public async Task AddKanbanColumnAsync(KanbanColumn kanbanColumn)
        {
            Logger.LogInformation($"Called: {nameof(AddKanbanColumnAsync)} from KanbanColumnServices");
            try
            {
                var userProjects = Context.UserProjects
               .Include(up => up.User)
               .Where(up => up.ProjectID == kanbanColumn.ProjectID)
               .ToList();

                if (!userProjects.Any())
                {
                    throw new Exception("No users found for the project or project does not exist.");
                }

                foreach (var userProject in userProjects)
                {
                    var user = userProject.User;

                    var kanbanColumnPom = new KanbanColumn
                    {
                        UserID = user.UserID,
                        ProjectID = kanbanColumn.ProjectID,
                        Status = kanbanColumn.Status,
                        Index = kanbanColumn.Index,
                        User = user,
                        Project = userProject.Project
                    };

                    Context.KanbanColumns.Add(kanbanColumnPom);
                }

                Context.SaveChanges();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddKanbanColumnAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteKanbanColumnAsync(KanbanColumn kanbanColumn)
        {
            Logger.LogInformation($"Called: {nameof(DeleteKanbanColumnAsync)} from KanbanColumnServices");
            try
            {

                var kanbanColumnsToDelete = Context.KanbanColumns
                .Where(kc => kc.ProjectID == kanbanColumn.ProjectID && kc.Status == kanbanColumn.Status)
                .ToList();

                if (!kanbanColumnsToDelete.Any())
                {
                    throw new Exception("No Kanban columns found with the provided criteria.");
                }

                Context.KanbanColumns.RemoveRange(kanbanColumnsToDelete);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(DeleteKanbanColumnAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<KanbanColumn>> GetAllKanbanColumnsAsync()
        {
            Logger.LogInformation($"Called: {nameof(GetAllKanbanColumnsAsync)} from KanbanColumnServices");
            try
            {
                return await Context.KanbanColumns.ToListAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAllKanbanColumnsAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateKanbanColumnAsync(KanbanColumn kanbanColumn, int index)
        {
            Logger.LogInformation($"Called: {nameof(UpdateKanbanColumnAsync)} from ProjectRoleServices");

            try
            {
                if (kanbanColumn == null)
                {
                    Logger.LogError("KanbanColumn is null.");
                    return;
                }
                var existingKanbanColumn = await Context.KanbanColumns.FirstOrDefaultAsync(x =>
                    x.ProjectID == kanbanColumn.ProjectID &&
                    x.UserID == kanbanColumn.UserID &&
                    x.Status == kanbanColumn.Status);

                if (existingKanbanColumn == null)
                {
                    Logger.LogError("KanbanColumn not found.");
                    return;
                }

                existingKanbanColumn.Index = index;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateKanbanColumnAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<KanbanColumn>> GetKanbanColumnsByUserIdAndProjectIdAsync(int userId, int projectId) {
            Logger.LogInformation($"Called: {nameof(GetKanbanColumnsByUserIdAndProjectIdAsync)} from KanbanColumnServices");

            try {
                return await Context.KanbanColumns
                    .Where(x => x.UserID == userId && x.ProjectID == projectId)
                    .OrderBy(x => x.Index)
                    .ToListAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetKanbanColumnsByUserIdAndProjectIdAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<KanbanColumn>> GetKanbanColumnsByUserIdSortedByIndexAsync(int userId) {
            Logger.LogInformation($"Called: {nameof(GetKanbanColumnsByUserIdSortedByIndexAsync)} from KanbanColumnServices");

            try {

                // Retrieve all Kanban columns for the given user
                var kanbanColumns = await Context.KanbanColumns
                    .Where(x => x.UserID == userId)
                    .OrderBy(x => x.ProjectID) // Order by project ID
                    .ThenBy(x => x.Index) // Then order by index
                    .ToListAsync();

                // Group by column name in memory and select the first element of each group
                var uniqueKanbanColumns = kanbanColumns
                    .GroupBy(x => x.Status)
                    .Select(group => group.First())
                    .OrderBy(x => x.Index) // Order by index again
                    .ToList();

                // Assign new indices based on the order
                for (int i = 0; i < uniqueKanbanColumns.Count; i++) {
                    uniqueKanbanColumns[i].Index = i+1;
                }

                return uniqueKanbanColumns;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetKanbanColumnsByUserIdSortedByIndexAsync)}: {ex.Message}");
                throw;
            }
        }


    }
}
