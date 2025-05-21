using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.Assignment;
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
    public class AssignmentListServices : IAssignmentListServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public AssignmentListServices(ApplicationDbContext mContext, ILoggger loger)
        {
            Logger = loger;
            Context = mContext;
        }
        public async Task AddAssignmentListAsync(AssignmentList assignmentList)
        {
            Logger.LogInformation($"Called: {nameof(AddAssignmentListAsync)} from AssignmentListServices");
            try
            {
                Context.AssignmentLists.Add(assignmentList);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddAssignmentListAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAssignmentListAsync(int AssignmentListID)
        {
            Logger.LogInformation($"Called: {nameof(DeleteAssignmentListAsync)} from AssignmentListServices");
            try
            {
                var existingAssignmentList = await Context.AssignmentLists.FirstOrDefaultAsync(x => x.AssignmentListID == AssignmentListID);

                if (existingAssignmentList == null)
                    return;

                Context.AssignmentLists.Remove(existingAssignmentList);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(DeleteAssignmentListAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<AssignmentList>> GetAllAssignmentListsAsync()
        {
            Logger.LogInformation($"Called: {nameof(GetAllAssignmentListsAsync)} from AssignmentListServices");
            try
            {
                return await Context.AssignmentLists.ToListAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAllAssignmentListsAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<AssignmentList> GetAssignmentListByID(int AssignmentListID)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentListByID)} with AssignmentListID: {AssignmentListID} from AssignmentListServices");
            try
            {
                return await Context.AssignmentLists.FirstOrDefaultAsync(x => x.AssignmentListID == AssignmentListID) ?? throw new Exception("Assignment list not found");
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentListByID)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateAssignmentListAsync(AssignmentList assignmentList, int AssignmentListID)
        {
            Logger.LogInformation($"Called: {nameof(UpdateAssignmentListAsync)} from AssignmentListServices");

            try
            {
                var existingAssignmentList = await Context.AssignmentLists.FirstOrDefaultAsync(x => x.AssignmentListID == AssignmentListID);
                if (existingAssignmentList == null)
                    return;

                existingAssignmentList.AssignmentListName = assignmentList.AssignmentListName;
                existingAssignmentList.Description = assignmentList.Description;

                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateAssignmentListAsync)}: {ex.Message}");
                throw;
            }
        }
        // Method to get all assignment lists for a given project
        public async Task<List<AssignmentList>> GetAssignmentListsForProjectAsync(int projectId)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentListsForProjectAsync)} from AssignmentListServices");

            try
            {
                return await Context.AssignmentLists
                    .Where(al => al.ProjectID == projectId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentListsForProjectAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<Assignment>> GetAssignmentsForProjectAndUserAsync(int projectId, int userId) 
           {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsForProjectAndUserAsync)} from AssignmentListServices");

            try {
                // Get the assignment IDs for the given user
                var userAssignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == userId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                
                // Get the assignments that belong to the specified user and are part of the assignment lists for the project
                var assignmentsForUserAndProject = await Context.Assignments
                    .Include(a => a.AssignmentLeader)
                    .Include(a => a.AssignmentList)
                    .Where(a => userAssignmentIds.Contains(a.AssignmentID) && a.AssignmentList.ProjectID == projectId)
                    .OrderBy(a => a.Priority)
                    .ToListAsync();

                return assignmentsForUserAndProject;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAssignmentsForProjectAndUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Assignment>> GetAssignmentsByAssignmentListID(int AssignmentListID)
        {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsByAssignmentListID)} from AssignmentListServices");

            try
            {
                var assignments =  await Context.Assignments
                   .Include(a => a.AssignmentLeader)
                   .Include(a => a.AssignmentList)
                   .Where(a => a.AssignmentListID == AssignmentListID)
                   .OrderBy(a => a.Deadline)
                   .ToListAsync();
                return assignments;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAssignmentsByAssignmentListID)}: {ex.Message}");
                throw;
            }
           

        }
        public async Task<List<Assignment>> GetAssignmentsForAssignmentListAndUserAsync(int assignmentListId, int userId) {
            Logger.LogInformation($"Called: {nameof(GetAssignmentsForAssignmentListAndUserAsync)} from AssignmentListServices");

            try {
                // Get the assignment IDs for the given user
                var userAssignmentIds = await Context.UserAssignments
                    .Where(ua => ua.UserID == userId)
                    .Select(ua => ua.AssignmentID)
                    .ToListAsync();

                // Get the assignments that belong to the specified user and assignment list
                var assignmentsForAssignmentListAndUser = await Context.Assignments
                    .Include(a => a.AssignmentLeader)
                    .Include(a => a.AssignmentList)
                    .Where(a => userAssignmentIds.Contains(a.AssignmentID) && a.AssignmentListID == assignmentListId)
                    .OrderBy(a => a.Deadline)
                    .ToListAsync();

                return assignmentsForAssignmentListAndUser;
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAssignmentsForAssignmentListAndUserAsync)}: {ex.Message}");
                throw;
            }
        }




    }
}
