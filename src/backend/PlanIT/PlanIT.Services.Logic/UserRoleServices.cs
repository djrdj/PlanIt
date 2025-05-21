using PlanIT.Services.Interface;
using PlanIT.Models;
using PlanIT.Logging;
using PlanIT.DataAccessLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace PlanIT.Services.Logic
{
    public class UserRoleServices : IUserRoleServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public UserRoleServices(ApplicationDbContext context, ILoggger loger) {
            Logger = loger;
            Context = context;
        }

        public async Task<List<UserRole>> GetAllUserRolesAsync() {
            Logger.LogInformation($"Called: {nameof(GetAllUserRolesAsync)} from UserRoleServices");
            try {
                return await Context.UserRoles.ToListAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAllUserRolesAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<UserRole> GetUserRoleByID(int UserRoleID) {
            Logger.LogInformation($"Called: {nameof(GetUserRoleByID)} with UserRoleID: {UserRoleID} from UserRoleServices");
            try {
                return await Context.UserRoles.FirstOrDefaultAsync(x => x.UserRoleID == UserRoleID) ?? throw new Exception("UserRole not found");
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetUserRoleByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task AddUserRoleAsync(UserRole userRole) {
            Logger.LogInformation($"Called: {nameof(AddUserRoleAsync)} from UserRoleServices");
            try {
                Context.UserRoles.Add(userRole);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(AddUserRoleAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task DeleteUserRoleAsync(int UserRoleID) {
            Logger.LogInformation($"Called: {nameof(DeleteUserRoleAsync)} from UserRoleServices");
            try {
                var existingUserRole = await Context.UserRoles.FirstOrDefaultAsync(x => x.UserRoleID == UserRoleID);

                if (existingUserRole == null)
                    return;

                Context.UserRoles.Remove(existingUserRole);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(DeleteUserRoleAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task UpdateUserRoleAsync(UserRole userRole, int UserRoleID) {
            Logger.LogInformation($"Called: {nameof(UpdateUserRoleAsync)} from UserRoleServices");

            try {
                var existingUserRole = await Context.UserRoles.FirstOrDefaultAsync(x => x.UserRoleID == UserRoleID);
                if (existingUserRole == null)
                    return;

                existingUserRole.UserRoleName = userRole.UserRoleName;

                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(UpdateUserRoleAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}
