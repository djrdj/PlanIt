using Azure.Core;
using PlanIT.Services.Interface;
using System.Net;
using System.Net.Mail;

namespace PlanIT.Services.Logic
{
    public class EmailService : IEmailService
    {

        public Task SendEmailAsync(string email, string subject, string message)
        {
            var client = new SmtpClient("smtp.office365.com", 587)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential("plan.it.2024@hotmail.com", "Bobanplanit")
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("plan.it.2024@hotmail.com"),
                Subject = subject,
                Body = message,
                IsBodyHtml = true
            };
            mailMessage.To.Add(email);

            return client.SendMailAsync(mailMessage);
        }
    }
}
