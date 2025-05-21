using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IUserRoleServices
    {
        Task<List<UserRole>> GetAllUserRolesAsync();
        Task<UserRole> GetUserRoleByID(int UserRoleID);
        Task AddUserRoleAsync(UserRole userRole);
        Task DeleteUserRoleAsync(int UserRoleID);
        Task UpdateUserRoleAsync(UserRole userRole, int UserRoleID);
    }
}
