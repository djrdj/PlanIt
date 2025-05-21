using Microsoft.Extensions.Configuration;
using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface IUserServices
    {
        Task<List<User>> GetAllUsersAsync();
        Task<User> GetUserByID(int UserID);
        Task AddTokenToUser(User user, string token);
        Task<string> GetUserRoleName(int userRoleID);
        Task AddUserAsync(User user);
        Task ArchiveUserAsync(int UserID);
        Task UpdateUserAsync(User user, int UserID);
        Task<User> GetUserByLogIn(UserLoginDTO userLoginDTO);
        Task UpdateUserPassword(string userEmail, string newPassword);
        Task<User> IsEvalidEmail(string userEmail);
        Task<int> GetActiveTasksCountByUser(int UserID);
        Task<string> UploadImageAsync(ImageUploadModel model, IConfiguration _configuration);
        Task<List<GetProjectDetailsDTO>> GetProjectsByUserId(int UserId);
        Task UpdateActivityForUser(int userID);
        Task SetUserRoleForUser(int userID, int userRoleID);
        Task UpdateDarkTheme(int UserID, int DarkTheme);
        Task UpdateLanguage(int UserID, string Language);
        Task UpdatePushEmailSettings(int UserID, int type);
        Task UpdatePushNotificationSettings(int UserID, int type);
        Task<GetFullNameForUserDTO> FullNameForUserDTO(int UserID);
        Task AddUsersFromCSVAsync(List<User> users);
        Task<bool> UsernameExistsAsync(string username);
    }
}
