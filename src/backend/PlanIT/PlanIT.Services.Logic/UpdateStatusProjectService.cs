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
    public class UpdateStatusProjectService : IInvocable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger _logger;

        public UpdateStatusProjectService(ApplicationDbContext dbContext, ILogger<UpdateStatusProjectService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task Invoke()
        {
            _logger.LogInformation($"Called: UpdateProjectStatus");

            DateTime today = DateTime.Now;
            var projectsToUpdate = _dbContext.Projects
                .Where(a => a.Status == "In Progress" && a.EndDate < today)
                .ToList();

            foreach (var project in projectsToUpdate)
            {
                _logger.LogInformation($"Updating status for project: {project.ProjectName}");
                project.Status = "Dismissed";
                _dbContext.Entry(project).State = EntityState.Modified;
            }

            var projectsToStart = _dbContext.Projects
                .Where(a => a.Status == "Planned" && a.StartDate <= today)
                .ToList();

            foreach (var project in projectsToStart) {
                _logger.LogInformation($"Updating status for project: {project.ProjectName}");
                project.Status = "In Progress";
                _dbContext.Entry(project).State = EntityState.Modified;
            }

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating project statuses: {ex.Message}");
                throw;
            }
        }
    }
}
