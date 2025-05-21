using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    public class UserServices : IUserServices {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public IPasswordHashService PasswordHashService { get; }
        
        public UserServices(ApplicationDbContext context, ILoggger loger, IPasswordHashService passwordHashService)
        {
            Logger = loger;
            Context = context;
            PasswordHashService = passwordHashService;
        }
        public async Task<List<User>> GetAllUsersAsync() {
            Logger.LogInformation($"Called: {nameof(GetAllUsersAsync)} from UserServices");
            try {
                return await Context.Users.ToListAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetAllUsersAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<User> GetUserByID(int UserID) {
            Logger.LogInformation($"Called: {nameof(GetUserByID)} with UserID: {UserID} from UserServices");
            try {

                return await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID) ?? throw new Exception("User not found");
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetUserByID)}: {ex.Message}");
                throw;
            }
        }
        public async Task AddTokenToUser(User user, string token)
        {
            Logger.LogInformation($"Called: {nameof(AddTokenToUser)} from UserServices");
            try
            {
                user.Token = token;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddTokenToUser)}: {ex.Message}");
                throw;
            }
        }
        public async Task AddUserAsync(User user) {
            Logger.LogInformation($"Called: {nameof(AddUserAsync)} from UserServices");
            try {
                user.Password = PasswordHashService.HashPassword(user.Password);
                user.Activated = 1;
                user.PictureURL = "default_user.jpg";
                user.DarkTheme = 0;
                user.Language = "en";
                user.PushNotificationSettings = 1;
                user.PushEmailSettings = 1;
                user.Token = "";
                Context.Users.Add(user);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(AddUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task ArchiveUserAsync(int UserID) {
            Logger.LogInformation($"Called: {nameof(ArchiveUserAsync)} from UserServices");
            try {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID);

                if (existingUser == null)
                    return;

                existingUser.Activated = 0;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(ArchiveUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateUserAsync(User user, int UserID) {
            Logger.LogInformation($"Called: {nameof(UpdateUserAsync)} from UserServices");

            try {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID);
                if (existingUser == null)
                    return;

                existingUser.Password = user.Password;
                existingUser.PhoneNumber = user.PhoneNumber;
                existingUser.PictureURL = user.PictureURL;
                existingUser.FirstName = user.FirstName;
                existingUser.LastName = user.LastName;
                existingUser.Email = user.Email;
                existingUser.TimeRegionID = user.TimeRegionID;
                existingUser.UserRoleID = user.UserRoleID;
                
                await Context.SaveChangesAsync();
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(UpdateUserAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<User> GetUserByLogIn(UserLoginDTO user)
        {
            Logger.LogInformation($"Called: {nameof(GetUserByLogIn)} from UserController");
            try
            {
                var foundUser = await Context.Users.FirstOrDefaultAsync(x =>
                    (x.Username.ToLower() == user.Username.ToLower() || x.Email.ToLower() == user.Username.ToLower()));

                if (foundUser == null)
                {
                    throw new Exception("User not found");
                }

                if (!PasswordHashService.VerifyPassword(foundUser.Password, user.Password))
                {
                    throw new Exception("Invalid password");
                }

                return foundUser;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetUserByLogIn)}: {ex.Message}");
                throw;
            }
        }

        public async Task<string> GetUserRoleName(int userID) {
            try {
                var user = await Context.Users
                    .Include(u => u.UserRole)
                    .FirstOrDefaultAsync(u => u.UserID == userID);

                if (user == null) {
                    throw new Exception("User not found");
                }

                return user.UserRole.UserRoleName; 
            }
            catch (Exception ex) {
                Logger.LogError($"Error in {nameof(GetUserRoleName)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateUserPassword(string userEmail, string newPassword)
        {
            Logger.LogInformation($"Called: {nameof(UpdateUserPassword)} from UserServices");
            try
            {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.Email == userEmail);
                if (existingUser == null)
                    return;
                existingUser.Password = PasswordHashService.HashPassword(newPassword);
                await Context.SaveChangesAsync();

            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateUserPassword)}: {ex.Message}");
                throw;
            }
        } 

        public async Task<User> IsEvalidEmail(string userEmail)
        {
            Logger.LogInformation($"Called: {nameof(IsEvalidEmail)} from UserServices");
            try
            {
                return await Context.Users.FirstOrDefaultAsync(x => x.Email == userEmail);
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(IsEvalidEmail)}: {ex.Message}");
                throw;
            }
        }

        public async Task<int> GetActiveTasksCountByUser(int UserID)
        {
            Logger.LogInformation($"Called: {nameof(GetActiveTasksCountByUser)} from UserServices");

            try
            {
                return await Context.UserAssignments
                    .Where(ua => ua.UserID == UserID && ua.Assignment.Status == "Status 1") // ZAMENITI ZA NAZIV STATUSA AKTIVNOG TASKA
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetActiveTasksCountByUser)}: {ex.Message}");
                throw;
            }
        }

        public async Task<string> UploadImageAsync(ImageUploadModel model, IConfiguration _configuration)
        {
            Logger.LogInformation($"Called: {nameof(UploadImageAsync)} from UserServices");

            try
            {
                if (model.ImageFile == null || model.ImageFile.Length == 0)
                    throw new ArgumentException("No image uploaded");

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension_validate = Path.GetExtension(model.ImageFile.FileName).ToLower();
                Logger.LogInformation($"{fileExtension_validate}");
                if (!allowedExtensions.Contains(fileExtension_validate))
                    throw new ArgumentException("Only JPG, JPEG, PNG, and GIF files are allowed");


                var user = Context.Users.FirstOrDefault(u => u.UserID == model.UserId);
                if (user == null)
                    throw new ArgumentException("User not found");

              
                var uploadsFolder = Path.Combine("/home/planit/front/dist/angular/browser/assets/profilepics");
               
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);
                var fileExtension = Path.GetExtension(model.ImageFile.FileName);
                var uniqueFileName = user.Username + fileExtension;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ImageFile.CopyToAsync(stream);
                }
                user.PictureURL = $"{uniqueFileName}";
                await Context.SaveChangesAsync();

                return user.PictureURL;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UploadImageAsync)}: {ex.Message}");
                throw;
            }

        }

        public async Task<List<GetProjectDetailsDTO>> GetProjectsByUserId(int UserId)
        {
            Logger.LogInformation($"Called: {nameof(GetProjectsByUserId)} from UserServices");
            try
            {
                var projects = await Context.UserProjects
                .Where(up => up.UserID == UserId)
                .Include(up => up.Project)
                    .ThenInclude(p => p.ProjectLeader)
                .Select(up => new GetProjectDetailsDTO
                {
                    ProjectID = up.Project.ProjectID,
                    ProjectName = up.Project.ProjectName,
                    Description = up.Project.Description,
                    Status = up.Project.Status,
                    StartDate = up.Project.StartDate,
                    EndDate = up.Project.EndDate,
                    ProjectLeaderID = up.Project.ProjectLeaderID,
                    ProjectLeaderFirstName = up.Project.ProjectLeader.FirstName,
                    ProjectLeaderLastName = up.Project.ProjectLeader.LastName,
                    ProjectLeaderURL = up.Project.ProjectLeader.PictureURL
                })
                .OrderBy(p => p.EndDate)
                .ToListAsync();

                return projects;

            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetProjectsByUserId)}: {ex.Message}");
                throw;
            }

        }

        public async Task UpdateActivityForUser(int userID)
        {
            Logger.LogInformation($"Called: {nameof(UpdateActivityForUser)} from UserServices");

            try
            {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == userID);
                if (existingUser == null)
                    return;

                existingUser.Activated = 1;

                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateActivityForUser)}: {ex.Message}");
                throw;
            }
        }

        public async Task SetUserRoleForUser(int userID, int userRoleID)
        {
            Logger.LogInformation($"Called: {nameof(SetUserRoleForUser)} from UserServices");
            try
            {
                var user = await Context.Users.FindAsync(userID);
                if (user != null)
                {
                    user.UserRoleID = userRoleID;
                    await Context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(SetUserRoleForUser)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateDarkTheme(int UserID, int DarkTheme)
        {
            Logger.LogInformation($"Called: {nameof(UpdateDarkTheme)} from UserServices");
            try
            {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID);
                if (existingUser == null)
                    return;

                existingUser.DarkTheme = DarkTheme;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateDarkTheme)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateLanguage(int UserID, string Language)
        {
            Logger.LogInformation($"Called: {nameof(UpdateLanguage)} from UserServices");
            try
            {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID);
                if (existingUser == null)
                    return;

                existingUser.Language = Language;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateLanguage)}: {ex.Message}");
                throw;
            }
        }
        public async Task UpdatePushEmailSettings(int UserID, int type)
        {
            Logger.LogInformation($"Called: {nameof(UpdatePushEmailSettings)} from UserServices");
            try
            {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID);
                if (existingUser == null)
                    return;

                existingUser.PushEmailSettings = type;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdatePushEmailSettings)}: {ex.Message}");
                throw;
            }
        }
        public async Task UpdatePushNotificationSettings(int UserID, int type)
        {
            Logger.LogInformation($"Called: {nameof(UpdatePushNotificationSettings)} from UserServices");
            try
            {
                var existingUser = await Context.Users.FirstOrDefaultAsync(x => x.UserID == UserID);
                if (existingUser == null)
                    return;

                existingUser.PushNotificationSettings = type;
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdatePushNotificationSettings)}: {ex.Message}");
                throw;
            }
        }

        public async Task<GetFullNameForUserDTO> FullNameForUserDTO(int UserID)
        {
            Logger.LogInformation($"Called: {nameof(FullNameForUserDTO)} from UserService");
            try
            {
                var user = await Context.Users
                    .Where(u => u.UserID == UserID)
                    .Select(u => new { u.FirstName, u.LastName })
                    .FirstOrDefaultAsync();


                if (user != null)
                {
                    GetFullNameForUserDTO a = new GetFullNameForUserDTO();
                    a.FirstName = user.FirstName;
                    a.LastName = user.LastName;
                    return a;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(FullNameForUserDTO)}: {ex.Message}");
                throw;
            }
        }
        public async Task AddUsersFromCSVAsync(List<User> users)
        {
            Logger.LogInformation($"Called: {nameof(AddUsersFromCSVAsync)} from UserServices");
            try
            {
                foreach (var user in users)
                {
                    user.Password = PasswordHashService.HashPassword(user.Password);
                    user.Activated = 1;
                    user.PictureURL = "default_user.jpg";
                    user.DarkTheme = 0;
                    user.Language = "en";
                    user.PushNotificationSettings = 1;
                    user.PushEmailSettings = 1;
                    user.Token = "";
                    Context.Users.Add(user);
                }
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddUsersFromCSVAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await Context.Users.AnyAsync(u => u.Username == username);
        }
    }
}
