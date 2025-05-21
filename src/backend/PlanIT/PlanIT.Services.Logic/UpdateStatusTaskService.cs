using Coravel.Invocable;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PlanIT.DataAccessLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    public class UpdateTaskStatusService : IInvocable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger _logger;

        public UpdateTaskStatusService(ApplicationDbContext dbContext, ILogger<UpdateTaskStatusService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task Invoke()
        {
            _logger.LogInformation($"Called: UpdateTaskStatus");

            DateTime today = DateTime.Now;
            var tasksToUpdate = _dbContext.Assignments
                .Where(a => a.Status == "In Progress" && a.Deadline < today)
                .ToList();

            foreach (var task in tasksToUpdate)
            {
                _logger.LogInformation($"Updating status for task: {task.AssignmentID}");
                task.Status = "Dismissed";
                _dbContext.Entry(task).State = EntityState.Modified;
            }

            var tasksToStart = _dbContext.Assignments
                .Where(a => a.Status == "Planned" && a.CreationDate <= today)
                .ToList();

            foreach (var task in tasksToStart) {
                _logger.LogInformation($"Updating status for task: {task.AssignmentID}");
                task.Status = "In Progress";
                _dbContext.Entry(task).State = EntityState.Modified;
            }

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating task statuses: {ex.Message}");
                throw;
            }
        }
    }

}
