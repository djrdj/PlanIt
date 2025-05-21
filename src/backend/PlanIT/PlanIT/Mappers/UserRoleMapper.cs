using PlanIT.DataTransferModel.UserRole;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class UserRoleMapper
    {
        public static GetUserRoleDTO ToDto(this UserRole userRole) => new()
        {
            UserRoleID = userRole.UserRoleID,
            UserRoleName = userRole.UserRoleName
        };

        public static UserRole FromDto(this CreateUserRoleDTO dto) => new()
        {
            UserRoleName = dto.UserRoleName
        };
        public static UserRole FromDto(this UpdateUserRoleDTO dto) => new()
        {
            UserRoleName = dto.UserRoleName
        };
    }
}
