using Coravel.Invocable;
using PlanIT.DataAccessLayer;
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
    public class BirthdayEmailService : IInvocable
    {
        public IEmailService _emailService { get; }
        public ILoggger Logger { get; }

        private readonly ApplicationDbContext _dbContext;

        public BirthdayEmailService(IEmailService emailService, ApplicationDbContext dbContext, ILoggger loggger)
        {
            _emailService = emailService;
            _dbContext = dbContext;
            Logger = loggger;
        }

        public async Task Invoke()
        {
            Logger.LogInformation($"Called: SendBirthdayMail");
            DateTime today = DateTime.Today;
            var usersWithBirthdayToday = _dbContext.Users
                .Where(u => u.DateOfBirth.Month == today.Month && u.DateOfBirth.Day == today.Day)
                .ToList();

            foreach (var user in usersWithBirthdayToday)
            {
                string subject = "Happy Birthday!";
                string body = $@"
                                    <html>
                                    <body>
                                        <div style='font-family: Arial, sans-serif;'>
                                            <h2 style='color: #2E86C1;'>Deadline Reminder</h2>
                                            <p>Dear {user.FirstName},</p>
                                            <p>
                                                Happy Birthday! Wishing you a fantastic day filled with joy and happiness. You can take a day off today!\n
                                            </p>
                                            <br/>
                                             <svg width=""200"" height=""55"" viewBox=""0 0 200 55"" fill=""none"" xmlns=""http://www.w3.org/2000/svg"">
                                            <rect x=""91.2"" y=""7.68018"" width=""7.04"" height=""38.08"" fill=""black""/>
                                            <rect x=""160.96"" y=""7.68018"" width=""7.03999"" height=""38.08"" fill=""black""/>
                                            <rect x=""181.76"" y=""7.68018"" width=""7.04001"" height=""38.08"" fill=""black""/>
                                            <rect x=""170.88"" y=""7.68018"" width=""29.12"" height=""6.72"" fill=""black""/>
                                            <rect x=""60.48"" y=""7.68018"" width=""6.4"" height=""38.08"" fill=""black""/>
                                            <path fill-rule=""evenodd"" clip-rule=""evenodd"" d=""M69.114 35.2002H74.2401C81.8395 35.2002 88.0001 29.0396 88.0001 21.4402C88.0001 13.8407 81.8395 7.68018 74.2401 7.68018H66.5601V14.1555H74.2184C78.2416 14.1555 81.5031 17.4169 81.5031 21.4402C81.5031 25.4634 78.2416 28.7249 74.2184 28.7249H71.7265L69.114 35.2002Z"" fill=""black""/>
                                            <path fill-rule=""evenodd"" clip-rule=""evenodd"" d=""M135.36 45.7604H132.8V18.2404H139.52V20.663C141.552 18.9516 144.176 17.9204 147.04 17.9204C153.491 17.9204 158.72 23.1497 158.72 29.6004V45.7604H151.949C151.983 45.4985 152 45.2315 152 44.9604V30.8804C152 27.4342 149.206 24.6404 145.76 24.6404C142.314 24.6404 139.52 27.4342 139.52 30.8804V44.9604C139.52 45.2315 139.537 45.4985 139.571 45.7604H139.52H135.36Z"" fill=""black""/>
                                            <path fill-rule=""evenodd"" clip-rule=""evenodd"" d=""M100.91 31.9527C100.648 39.8529 106.534 46.4611 114.058 46.7126C117.371 46.8234 120.45 45.6825 122.88 43.696V45.7601H129.6V18.2407H122.88V21.0675C120.696 19.2951 117.979 18.203 115.006 18.1036C107.482 17.8521 101.171 24.0525 100.91 31.9527ZM115.2 40.0969C118.838 40.0969 121.909 37.7066 122.88 34.4345V30.0099C121.909 26.7378 118.838 24.3475 115.2 24.3475C110.782 24.3475 107.2 27.8731 107.2 32.2222C107.2 36.5713 110.782 40.0969 115.2 40.0969Z"" fill=""black""/>
                                            <rect width=""16.32"" height=""9.92"" rx=""4.96"" fill=""#E54C41""/>
                                            <rect x=""13.4399"" y=""14.7202"" width=""14.08"" height=""9.92"" rx=""4.96"" fill=""#F9BE15""/>
                                            <rect x=""14.72"" y=""44.48"" width=""16"" height=""9.92"" rx=""4.96"" fill=""#4C88EF""/>
                                            <rect y=""44.48"" width=""10.24"" height=""9.92"" rx=""4.96"" fill=""#4C88EF""/>
                                            <rect y=""14.7202"" width=""9.6"" height=""9.92"" rx=""4.8"" fill=""#F9BE15""/>
                                            <rect x=""18.24"" y=""29.4399"" width=""10.24"" height=""9.92"" rx=""4.96"" fill=""#3FA95B""/>
                                            <rect x=""32.6399"" y=""29.4399"" width=""9.6"" height=""9.92"" rx=""4.8"" fill=""#3FA95B""/>
                                            <rect x=""35.2"" y=""44.48"" width=""18.56"" height=""9.92"" rx=""4.96"" fill=""#4C88EF""/>
                                            <rect y=""29.4399"" width=""14.08"" height=""9.92"" rx=""4.96"" fill=""#3FA95B""/>
                                            </svg>
                                            <p>Best regards,<br/>PlanIT</p>
                                        </div>
                                    </body>
                                    </html>";
                await _emailService.SendEmailAsync(user.Email, subject, body);
            }
        }
    }
}
