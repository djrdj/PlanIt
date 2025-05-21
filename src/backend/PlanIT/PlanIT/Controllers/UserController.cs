using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.Assignment;
using PlanIT.DataTransferModel.Project;
using PlanIT.DataTransferModel.User;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;
using System.Globalization;
using System.Text.RegularExpressions;

namespace PlanIT.API.Controllers {
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        public IUserServices userService { get; }
        private readonly IConfiguration _configuration;
        private static readonly Dictionary<string, string> EmailTokenMap = new Dictionary<string, string>();
        private static readonly Dictionary<string, string> EmailTokenMapForRegister = new Dictionary<string, string>();
        Dictionary<string, int> monthMap = new Dictionary<string, int>()
        {
            { "January", 1 },
            { "February", 2 },
            { "March", 3 },
            { "April", 4 },
            { "May", 5 },
            { "June", 6 },
            { "July", 7 },
            { "August", 8 },
            { "September", 9 },
            { "October", 10 },
            { "November", 11 },
            { "December", 12 }
        };
        private static readonly Dictionary<string, int> UserNameRole = new Dictionary<string, int>(); // int : userRoleID is key, string : username is value
     
        public IEmailService emailService { get; }
        private readonly ITokenServices tokenServices;
        private readonly ILoggger loggger;
        private readonly IPasswordHashService passwordHashService;
        public UserController(ILoggger loger, IUserServices aLogic, ITokenServices its, IEmailService eService, IPasswordHashService passwordHashService, IConfiguration configuration) {
            loggger = loger;
            userService = aLogic;
            tokenServices = its;
            emailService = eService;
            this.passwordHashService = passwordHashService;
            _configuration = configuration;
        }


        [HttpGet]
        public async Task<List<GetUserDTO>> GetUsers() {
            loggger.LogInformation($"Called {nameof(GetUsers)} from UserController");
            var users = await userService.GetAllUsersAsync();
            var sortedUsers = users.OrderBy(u => u.Username);
            return sortedUsers.Select(UserMapper.ToDto).ToList();
        }

        [HttpGet("{userID}")]
        public async Task<GetUserDTO?> Get(int userID) {
            loggger.LogInformation($"Called {nameof(Get)} from UserController");
            var user = await userService.GetUserByID(userID);

            return user?.ToDto();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateUserDTO createUserDTO) {
            loggger.LogInformation($"Called {nameof(CreateUserDTO)} from UserController");

            try {
                await userService.AddUserAsync(createUserDTO.FromDto());
                return Ok(new { Message = "User added successfully" });
            }
            catch (Exception ex) {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpPost("import-user-from-csv")]
        public async Task<IActionResult> AddFromCSV([FromBody] List<UserCSVDTO> userCSVDTO)
        {
            loggger.LogInformation($"Called {nameof(AddFromCSV)} from UserController");

            try
            {
                var users = userCSVDTO.FromCSVDto();
                await userService.AddUsersFromCSVAsync(users);
                return Ok(new { Message = "Users added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(AddFromCSV)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [HttpPut("archive-user")]
        public async Task Archive(int userID) {
            loggger.LogInformation($"Called {nameof(Archive)} from UserController");
            await userService.ArchiveUserAsync(userID);
        }
        [HttpPut("{userID}")]
        public async Task Put(int userID, [FromBody] UpdateUserDTO updateUserDTO) {
            loggger.LogInformation($"Called {nameof(UpdateUserDTO)} from UserController");
            await userService.UpdateUserAsync(updateUserDTO.FromDto(), userID);

        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(UserLoginDTO userLoginDTO)
        {
            loggger.LogInformation($"Called {nameof(Login)} from UserController");

            try
            {

                var user = await userService.GetUserByLogIn(userLoginDTO);
                if (user != null)
                {
                    var userRoleName = await userService.GetUserRoleName(user.UserID);
                    string Token = tokenServices.CreateToken(user);
                    await userService.AddTokenToUser(user,Token);
                    return new UserDTO { Username = user.Username, Id = user.UserID, Token = Token, PictureUrl = user.PictureURL, UserRoleName = userRoleName };
                }
                else
                {
                    return Unauthorized(new { Message = "Invalid username or password" });
                }
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Login)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpPost("send-register-email")]
        public async Task<IActionResult> Register([FromBody] UserCreateNewDTO model)
        {
            loggger.LogInformation($"Called {nameof(Register)} from UserController");

            try
            {
                string emailRegex = @"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
                if (Regex.IsMatch(model.Email, emailRegex))
                {

                    string createToken = Guid.NewGuid().ToString();

                    EmailTokenMapForRegister[model.Email] = createToken;
                    EmailTokenMapForRegister[model.Username] = model.Email;
                    UserNameRole[model.Username] = model.UserRoleID;

                    var baseUrl = _configuration["AppSettings:BaseUrl"];

                    string resetLink = $"{baseUrl}/create-account?token={createToken}";
                    string subject = "Make your account";
                    string body = $@"
                                    <html>
                                    <body>
                                        <div style='font-family: Arial, sans-serif;'>
                                            <h2 style='color: #2E86C1;'>Make your account</h2>
                                            <p>Dear {model.Username}, </p>
                                            <p>Welcome to PlanIT,</p>
                                            <p>Click the following link to enter the world of planning !</p>
                                            <p>
                                                <a href='{resetLink}' style='display: inline-block; background-color: #2E86C1; color: white; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px;'>
                                                    Register
                                                </a>
                                            </p>
                                            <br/>
                                            <p>Best regards,<br/>PlanIT</p>
                                        </div>
                                    </body>
                                    </html>";
                    await emailService.SendEmailAsync(model.Email, subject, body);
                    
                    return Ok(new { Message = "Mail sent" });
                }
                else
                {
                    return BadRequest(new { Message = "Invalid email" });
                }
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Register)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] UserForgotPasswordDTO model)
        {
            loggger.LogInformation($"Called {nameof(ForgotPassword)} from UserController");

            try
            {
                string emailRegex = @"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
                var userFound = await userService.IsEvalidEmail(model.Email);
                if (Regex.IsMatch(model.Email, emailRegex) && userFound!=null)
                {

                    string resetToken = Guid.NewGuid().ToString();

                    EmailTokenMap[model.Email] = resetToken;
                    var baseUrl = _configuration["AppSettings:BaseUrl"];

                    string resetLink = $"{baseUrl}/newpassword?token={resetToken}";
                    string subject = "Forgot Password";
                    string body = $"Click the following link to reset your password: {resetLink}";
                    await emailService.SendEmailAsync(model.Email, subject, body);
                    return Ok(new { Message = "Mail sent" });
                }
                else
                {
                    return BadRequest(new { Message = "Invalid email" });
                }
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(ForgotPassword)}: {ex.Message}");
                return StatusCode(500, new { Message = "Error" });
            }
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] UserResetPasswordDTO model)
        {
            loggger.LogInformation($"Called: {nameof(ResetPassword)} from UserController");

            try
            {
                if (model == null || string.IsNullOrWhiteSpace(model.Token) || string.IsNullOrWhiteSpace(model.NewPassword))
                {
                    return BadRequest(new { Message = "Invalid request data" });
                }
                var userEmail = EmailTokenMap.FirstOrDefault(kv => kv.Value == model.Token);
                if (userEmail.Key != null && userEmail.Value == model.Token)
                {
                    await userService.UpdateUserPassword(userEmail.Key, model.NewPassword);
                    return Ok(new { Message = "Password reset successfully" });
                }
                else
                {
                    return NotFound(new { Message = "Token not found" });
                }
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(ResetPassword)}: {ex.Message}");
                return StatusCode(500, new { Message = "Error resetting password" });
            }
        }
        [HttpPut("register-user")]
        public async Task<IActionResult> CreateNewUser([FromBody] CreateNewUserDTO model)
        {
            loggger.LogInformation($"Called: {nameof(CreateNewUser)} from UserController");

            try
            {
                if (model == null || string.IsNullOrWhiteSpace(model.Token) || string.IsNullOrWhiteSpace(model.Password) || string.IsNullOrWhiteSpace(model.LastName) || string.IsNullOrWhiteSpace(model.FirstName))
                {
                    return BadRequest(new { Message = "Invalid request data" });
                }
                var userEmail = EmailTokenMapForRegister.FirstOrDefault(kv => kv.Value == model.Token);
                var username = EmailTokenMapForRegister.FirstOrDefault(kv => kv.Value == userEmail.Key);
                if (userEmail.Key != null && userEmail.Value == model.Token)
                {
                    DateTime dateOfBirth = new DateTime(model.Year, monthMap[model.Month], model.Day);

                    User us = new User();
                    us.Username = username.Key;
                    us.Password = model.Password;
                    us.FirstName = model.FirstName;
                    us.LastName = model.LastName;
                    us.Email = userEmail.Key;
                    us.PictureURL = "default_user.jpg";
                    us.PhoneNumber = model.PhoneNumber;
                    us.DateOfBirth = dateOfBirth;
                    us.TimeRegionID = model.TimeRegionID;
                    us.DarkTheme = 0;
                    us.Language = "en";
                    us.PushNotificationSettings = 1;
                    us.PushEmailSettings = 1;
                    us.Token = "";
                    us.UserRoleID = model.UserRoleID;

                    
                    await userService.AddUserAsync(us);
                    return Ok(new { Message = "Successfuly registered" });
                }
                else
                {
                    return NotFound(new { Message = "Token not found" });
                }
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(CreateNewUser)}: {ex.Message}");
                return StatusCode(500, new { Message = "Error creating account: " + ex });
            }
        }

        [HttpGet("get-task-count")]
        public async Task<int> GetUserCount(int UserID)
        {
            loggger.LogInformation($"Called {nameof(GetUserCount)} from UserController");
            var user = await userService.GetActiveTasksCountByUser(UserID);

            return user;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] ImageUploadModel model)
        { 

            loggger.LogInformation($"Called: {nameof(UploadImage)} from UserController");

            try
            {
                var imageUrl = await userService.UploadImageAsync(model, _configuration);
                return Ok(new { imageUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                loggger.LogInformation($"Called {nameof(UploadImage)} from UserController");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        [HttpPost("get-data-by-token")]
        public async Task<ActionResult<UserCreateNewDTO>> GetDataByToken([FromForm] string token)
        {

            loggger.LogInformation($"Called: {nameof(GetDataByToken)} from UserController");

            try
            {
                if (token == null)
                {
                    return BadRequest(new { Message = "Invalid request data" });
                }
                var userEmail = EmailTokenMapForRegister.FirstOrDefault(kv => kv.Value == token);
                var username = EmailTokenMapForRegister.FirstOrDefault(kv => kv.Value == userEmail.Key);
                var userRoleID = UserNameRole.FirstOrDefault(kv => kv.Key == username.Key);
                loggger.LogInformation($"Email, username: {userEmail.Key} from UserController {username.Key}");

                return new UserCreateNewDTO { Username = username.Key, Email = username.Value, UserRoleID = userRoleID.Value };
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(GetDataByToken)}: {ex.Message}");
                return StatusCode(500, new { Message = "Error: " + ex });
            }
        }

        [HttpGet("projects-by-user")]
        public async Task<List<GetProjectDetailsDTO>> GetAllProjectsByUserID(int UserID)
        {
            loggger.LogInformation($"Called {nameof(GetAllProjectsByUserID)} from UserController");
            return await userService.GetProjectsByUserId(UserID);
        }
        [HttpGet("update-activated-status")]
        public async Task UpdateActivatedStatus(int UserID)
        {
            loggger.LogInformation($"Called {nameof(UpdateActivatedStatus)} from UserController");
            await userService.UpdateActivityForUser(UserID);
        }
        [HttpGet("set-role-for-user")]
        public async Task SetUserRole(int UserID, int UserRoleID)
        {
            loggger.LogInformation($"Called {nameof(SetUserRole)} from UserController");
            await userService.SetUserRoleForUser(UserID, UserRoleID);
        }
        [HttpPut("update-dark-theme")]
        public async Task UpdateDarkTheme(int userID, int DarkTheme)
        {
            loggger.LogInformation($"Called {nameof(UpdateDarkTheme)} from UserController");
            await userService.UpdateDarkTheme(userID, DarkTheme);

        }
        [HttpPut("update-language")]
        public async Task UpdateLanguage(int userID, string Language)
        {
            loggger.LogInformation($"Called {nameof(UpdateLanguage)} from UserController");
            await userService.UpdateLanguage(userID, Language);

        }
        [HttpPut("update-pushEmailSettings")]
        public async Task UpdatePushEmailSettings(int userID, int type)
        {
            loggger.LogInformation($"Called {nameof(UpdatePushEmailSettings)} from UserController");
            await userService.UpdatePushEmailSettings(userID, type);

        }
        [HttpPut("update-pushNotificationSettings")]
        public async Task UpdatePushNotificationSettings(int userID, int type)
        {
            loggger.LogInformation($"Called {nameof(UpdatePushNotificationSettings)} from UserController");
            await userService.UpdatePushNotificationSettings(userID, type);

        }
        [HttpGet("fullName-by-id")]
        public async Task<GetFullNameForUserDTO> FullNameByUserID(int UserID)
        {
            loggger.LogInformation($"Called {nameof(FullNameByUserID)} from UserController");
            return await userService.FullNameForUserDTO(UserID);
        }
    }
}
