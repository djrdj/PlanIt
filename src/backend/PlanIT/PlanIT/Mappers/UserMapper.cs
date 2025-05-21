using Microsoft.AspNetCore.Identity;
using PlanIT.DataTransferModel.User;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class UserMapper
    {
        public static GetUserDTO ToDto(this User user) => new()
        {
            UserID = user.UserID,
            Username = user.Username,
            Token=user.Token,
            Password = user.Password,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            PictureUrl = user.PictureURL,
            Email = user.Email,
            DateOfBirth = user.DateOfBirth,
            TimeRegionID = user.TimeRegionID,
            Activated = user.Activated,
            UserRoleID = user.UserRoleID,
            DarkTheme = user.DarkTheme,
            Language = user.Language,
            PushEmailSettings = user.PushEmailSettings,
            PushNotificationSettings = user.PushNotificationSettings
            
        };

        public static User FromDto(this CreateUserDTO dto) => new()
        {
            Username = dto.Username,
            Password = dto.Password,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            PictureURL = dto.PictureURL,
            DateOfBirth = (DateTime)dto.DateOfBirth,
            TimeRegionID = (int)dto.TimeRegionID,
            UserRoleID = dto.UserRoleID
        };
        public static User FromCSVDto(this UserCSVDTO dto) => new()
        {
            Username = dto.Username,
            Password = dto.Password,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            DateOfBirth = (DateTime)dto.DateOfBirth,
            TimeRegionID = (int)dto.TimeRegionID,
            UserRoleID = (int)dto.UserRoleID
        };
        public static User FromDto(this UpdateUserDTO dto) => new()
        {
            Password = dto.Password,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            PictureURL = dto.PictureURL,
            Email = dto.Email,
            TimeRegionID = (int)dto.TimeRegionID,
            UserRoleID = (int)dto.UserRoleID
        };

        public static List<User> FromCSVDto(this List<UserCSVDTO> dtoList)
        {
            return dtoList.Select(dto => dto.FromCSVDto()).ToList();
        }
    }
}
