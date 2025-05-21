using Coravel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PlanIT.DataAccessLayer;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpClient<ClockifyService>();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddScheduler();
builder.Services.AddSignalR();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(connectionString));

var environment = builder.Environment;
var configuration = new ConfigurationBuilder()
    .SetBasePath(environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{environment.EnvironmentName}.json", optional: true) // Load environment-specific configuration
    .Build();
builder.Services.AddSingleton<IConfiguration>(configuration);

builder.Services.AddSingleton<ILoggger, ConsoleLogger>();
builder.Services.AddTransient<IProjectServices, ProjectServices>();
builder.Services.AddTransient<IAssignmentListServices, AssignmentListServices>();
builder.Services.AddTransient<IAssignmentServices, AssignmentServices>();
builder.Services.AddTransient<ICommentServices, CommentServices>();
builder.Services.AddTransient<IProjectRoleServices, ProjectRoleServices>();
builder.Services.AddTransient<ITimeRegionServices, TimeRegionServices>();
builder.Services.AddTransient<IUserServices, UserServices>();
builder.Services.AddTransient<IUser_ProjectServices, User_ProjectServices>();
builder.Services.AddTransient<IUserRoleServices, UserRoleServices>();
builder.Services.AddTransient<IUserAssignmentService, UserAssignmentService>();
builder.Services.AddTransient<IKanbanColumnServices, KanbanColumnServices>();
builder.Services.AddTransient<ITokenServices, TokenServices>();
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddTransient<IPasswordHashService, PasswordHashService>();
builder.Services.AddTransient<INotificationServices, NotificationService>();
builder.Services.AddTransient<IClockifyService, ClockifyService>();
builder.Services.AddTransient<IStatisticsServices, StatisticsServices>();
builder.Services.AddTransient<BirthdayEmailService>();
builder.Services.AddTransient<UpdateTaskStatusService>();
builder.Services.AddTransient<UpdateStatusProjectService>();
builder.Services.AddTransient<DayBeforeDeadlineService>();
var baseUrl = configuration.GetValue<string>("AppSettings:BaseUrl");
var app = builder.Build();

app.Services.UseScheduler(scheduler =>
{
    scheduler.Schedule<BirthdayEmailService>().DailyAtHour(10).Zoned(TimeZoneInfo.Local);
    scheduler.Schedule<UpdateTaskStatusService>().Hourly().Zoned(TimeZoneInfo.Local);
    scheduler.Schedule<UpdateStatusProjectService>().Hourly().Zoned(TimeZoneInfo.Local);
    scheduler.Schedule<DayBeforeDeadlineService>().DailyAtHour(8).Zoned(TimeZoneInfo.Local);
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
var allowedOrigins = new[] { "http://localhost:4200", "https://localhost:4200", "http://softeng.pmf.kg.ac.rs:10152" };
app.UseCors(builder => builder
.SetIsOriginAllowed(origin => allowedOrigins.Contains(origin) || origin.StartsWith("http://localhost:") || origin.StartsWith("http://softeng.pmf.kg.ac.rs:"))
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials());

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
