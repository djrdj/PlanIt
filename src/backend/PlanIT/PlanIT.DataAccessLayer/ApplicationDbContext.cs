using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using PlanIT.Models;
using PlanIT.Services.Interface;

namespace PlanIT.DataAccessLayer {
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<TimeRegion> TimeRegions { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<AssignmentList> AssignmentLists { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<User_Project> UserProjects { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<ProjectRole> ProjectRoles { get; set; }
        public DbSet<User_Assignment> UserAssignments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<KanbanColumn> KanbanColumns { get; set; }
        public DbSet<TimeEntry> TimeEntries { get; set; }

        // interfejs za hesiranje, da bi mogli da dodamo usera

        private readonly IPasswordHashService _passwordHashService;
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IPasswordHashService passwordHashService)
            : base(options) {
            _passwordHashService = passwordHashService;
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            //User TABLE
            modelBuilder.Entity<User>().HasKey(u => u.UserID); // UserID se stavlja za Primary key
            modelBuilder.Entity<User>(x => x.HasIndex(y => y.Email).IsUnique());
            modelBuilder.Entity<User>(x => x.HasIndex(y => y.Username).IsUnique());
            modelBuilder.Entity<User>()
                .HasOne(u => u.TimeRegion)
                .WithMany()
                .HasForeignKey(u => u.TimeRegionID); // Foreign key za TimeZone

            modelBuilder.Entity<User>()
                .HasOne(u => u.UserRole)
                .WithMany()
                .HasForeignKey(u => u.UserRoleID); // Foreign key za UserRole

            //TimeRegion TABLE
            modelBuilder.Entity<Models.TimeRegion>().HasKey(tz => tz.TimeRegionId);

            //TimeEntry TABLE
            modelBuilder.Entity<Models.TimeEntry>().HasKey(tz => tz.TimeEntryID);

            //Project TABLE
            modelBuilder.Entity<Project>().HasKey(p => p.ProjectID); // ProjectId se stavlja za Primary key
            modelBuilder.Entity<Project>()
            .HasOne(p => p.ProjectLeader)
            .WithMany()
            .HasForeignKey(p => p.ProjectLeaderID);

            //UserRole TABLE
            modelBuilder.Entity<UserRole>().HasKey(ur => ur.UserRoleID); // UserRoleID se stavlja za Primary key

            //ProjectRole TABLE
            modelBuilder.Entity<ProjectRole>().HasKey(pr => pr.ProjectRoleID); //ProjectRoleID se stavlja za Primary key

            //Assignment TABLE
            modelBuilder.Entity<Assignment>().HasKey(a => a.AssignmentID); // AssignmentID se stavlja za Primary key

            modelBuilder.Entity<Assignment>()
                .Property(a => a.AssignmentName)
                .IsRequired(); // AssignmentName je obavezno

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.AssignmentList)
                .WithMany(al => al.Assignments)
                .HasForeignKey(a => a.AssignmentListID); // Foreign key za AssignmentList

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.AssignmentLeader)
                .WithMany(u => u.AssignmentLeads)
                .HasForeignKey(a => a.AssignmentLeadID); // Foreign key za User



            //AssignmentList TABLE
            modelBuilder.Entity<AssignmentList>().HasKey(tl => tl.AssignmentListID); // AssignmentListID se stavlja za Primary key

            modelBuilder.Entity<AssignmentList>()
                .HasOne(tl => tl.Project)
                .WithMany(p => p.AssignmentLists)
                .HasForeignKey(tl => tl.ProjectID);


            //Comment TABLE
            modelBuilder.Entity<Comment>().HasKey(c => c.CommentID); // CommentID se stavlja za Primary key
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserID) // Foreign key for the user who wrote the comment
                .OnDelete(DeleteBehavior.Restrict); // Specify OnDelete behavior


            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Assignment)
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.AssignmentID); // Foreign key za task na kom je napisan

            //KanbanColumns
            modelBuilder.Entity<KanbanColumn>()
                .HasKey(up => new { up.UserID, up.ProjectID, up.Status }); // Primary key for the KanbanColumns table

            modelBuilder.Entity<KanbanColumn>()
                .HasOne(up => up.User)
                .WithMany(u => u.KanbanColumns)
                .HasForeignKey(up => up.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<KanbanColumn>()
               .HasOne(up => up.Project)
               .WithMany(p => p.KanbanColumns)
               .HasForeignKey(up => up.ProjectID)
               .OnDelete(DeleteBehavior.Restrict);

            // User_Project TABLE
            modelBuilder.Entity<User_Project>()
                .HasKey(up => new { up.UserID, up.ProjectID }); // Primary key for the User_Project table

            modelBuilder.Entity<User_Project>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserProjects)
                .HasForeignKey(up => up.UserID)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<User_Project>()
                .HasOne(up => up.Project)
                .WithMany(p => p.UserProjects)
                .HasForeignKey(up => up.ProjectID) 
                .OnDelete(DeleteBehavior.Restrict);        

            //User_Assignment TABLE
            modelBuilder.Entity<User_Assignment>().HasKey(up => new { up.UserID, up.AssignmentID, up.Type }); // Primary key za tabelu User_Assignment

            modelBuilder.Entity<User_Assignment>()
             .HasOne(ua => ua.User)
             .WithMany(u => u.UserAssignments)
             .HasForeignKey(ua => ua.UserID) 
             .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<User_Assignment>()
                .HasOne(up => up.Assignment)
                .WithMany(p => p.UserAssignments)
                .HasForeignKey(up => up.AssignmentID); // Foreign key za Assignment
            
            //Notification
            modelBuilder.Entity<Notification>().HasKey(up => new {up.NotificationID }); // Primary key za tabelu Notifications

            modelBuilder.Entity<Notification>()
                .HasOne(up => up.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(up => up.UserID); // Foreign key za User-a
        
            base.OnModelCreating(modelBuilder);
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder) {

            // Seed TimeRegion
            modelBuilder.Entity<TimeRegion>().HasData(
                new TimeRegion { TimeRegionId = 1, TimeRegionName = "Central European Time (CET) - UTC+1" },
                new TimeRegion { TimeRegionId = 2, TimeRegionName = "Eastern European Time (EET) - UTC+2" },
                new TimeRegion { TimeRegionId = 3, TimeRegionName = "Central European Summer Time (CEST) - UTC+2" },
                new TimeRegion { TimeRegionId = 4, TimeRegionName = "Eastern European Summer Time (EEST) - UTC+3" },
                new TimeRegion { TimeRegionId = 5, TimeRegionName = "China Standard Time (CST) - UTC+8" },
                new TimeRegion { TimeRegionId = 6, TimeRegionName = "Australian Western Standard Time (AWST) - UTC+8" },
                new TimeRegion { TimeRegionId = 7, TimeRegionName = "Australian Central Standard Time (ACST) - UTC+9:30" },
                new TimeRegion { TimeRegionId = 8, TimeRegionName = "Australian Eastern Standard Time (AEST) - UTC+10" },
                new TimeRegion { TimeRegionId = 9, TimeRegionName = "Japan Standard Time (JST) - UTC+9" },
                new TimeRegion { TimeRegionId = 10, TimeRegionName = "India Standard Time (IST) - UTC+5:30" }
            );

            // Seed UserRole
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole { UserRoleID = 1, UserRoleName = "Administrator" },
                new UserRole { UserRoleID = 2, UserRoleName = "Manager" },
                new UserRole { UserRoleID = 3, UserRoleName = "Employee" }
              //  new UserRole { UserRoleID = 4, UserRoleName = "Team Leader" }

            );

            // Seed KanbanColumns
            modelBuilder.Entity<KanbanColumn>().HasData(
                // For UserID = 1, ProjectID = 1
                new KanbanColumn { ProjectID = 1, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 1, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 1, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 1, UserID = 1, Status = "Dismissed", Index = 4 },

                // For UserID = 2, ProjectID = 1
                new KanbanColumn { ProjectID = 1, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 1, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 1, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 1, UserID = 2, Status = "Dismissed", Index = 4 },

                // For UserID = 3, ProjectID = 1
                new KanbanColumn { ProjectID = 1, UserID = 3, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 1, UserID = 3, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 1, UserID = 3, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 1, UserID = 3, Status = "Dismissed", Index = 4 },                

                new KanbanColumn { ProjectID = 2, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 2, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 2, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 2, UserID = 1, Status = "Dismissed", Index = 4 },


                new KanbanColumn { ProjectID = 3, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 3, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 3, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 3, UserID = 1, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 5, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 5, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 5, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 5, UserID = 1, Status = "Dismissed", Index = 4 },
              
                new KanbanColumn { ProjectID = 7, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 7, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 7, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 7, UserID = 1, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 8, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 8, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 8, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 8, UserID = 1, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 9, UserID = 1, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 9, UserID = 1, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 9, UserID = 1, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 9, UserID = 1, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 2, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 2, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 2, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 2, UserID = 2, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 3, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 3, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 3, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 3, UserID = 2, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 5, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 5, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 5, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 5, UserID = 2, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 6, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 6, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 6, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 6, UserID = 2, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 8, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 8, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 8, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 8, UserID = 2, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 10, UserID = 2, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 10, UserID = 2, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 10, UserID = 2, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 10, UserID = 2, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 2, UserID = 3, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 2, UserID = 3, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 2, UserID = 3, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 2, UserID = 3, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 4, UserID = 3, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 4, UserID = 3, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 4, UserID = 3, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 4, UserID = 3, Status = "Dismissed", Index = 4 },

                new KanbanColumn { ProjectID = 5, UserID = 3, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 5, UserID = 3, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 5, UserID = 3, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 5, UserID = 3, Status = "Dismissed", Index = 4 },
                new KanbanColumn { ProjectID = 6, UserID = 3, Status = "Planned", Index = 1 },

                new KanbanColumn { ProjectID = 6, UserID = 3, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 6, UserID = 3, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 6, UserID = 3, Status = "Dismissed", Index = 4 },
                new KanbanColumn { ProjectID = 10, UserID = 3, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 10, UserID = 3, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 10, UserID = 3, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 10, UserID = 3, Status = "Dismissed", Index = 4 },
                // For ProjectID = 2
                new KanbanColumn { ProjectID = 2, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 2, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 2, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 2, UserID = 4, Status = "Dismissed", Index = 4 },

                // For ProjectID = 3
                new KanbanColumn { ProjectID = 3, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 3, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 3, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 3, UserID = 4, Status = "Dismissed", Index = 4 },

                // For ProjectID = 4
                new KanbanColumn { ProjectID = 4, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 4, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 4, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 4, UserID = 4, Status = "Dismissed", Index = 4 },

                // For ProjectID = 5
                new KanbanColumn { ProjectID = 5, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 5, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 5, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 5, UserID = 4, Status = "Dismissed", Index = 4 },

                // For ProjectID = 6
                new KanbanColumn { ProjectID = 6, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 6, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 6, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 6, UserID = 4, Status = "Dismissed", Index = 4 },

                // For ProjectID = 7
                new KanbanColumn { ProjectID = 7, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 7, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 7, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 7, UserID = 4, Status = "Dismissed", Index = 4 },

                // For ProjectID = 9
                new KanbanColumn { ProjectID = 9, UserID = 4, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 9, UserID = 4, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 9, UserID = 4, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 9, UserID = 4, Status = "Dismissed", Index = 4 },
                // For UserID = 5 and ProjectID = 1
                new KanbanColumn { ProjectID = 1, UserID = 5, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 1, UserID = 5, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 1, UserID = 5, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 1, UserID = 5, Status = "Dismissed", Index = 4 },

                // For UserID = 5 and ProjectID = 3
                new KanbanColumn { ProjectID = 3, UserID = 5, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 3, UserID = 5, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 3, UserID = 5, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 3, UserID = 5, Status = "Dismissed", Index = 4 },

                // For UserID = 5 and ProjectID = 4
                new KanbanColumn { ProjectID = 4, UserID = 5, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 4, UserID = 5, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 4, UserID = 5, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 4, UserID = 5, Status = "Dismissed", Index = 4 },

                // For UserID = 5 and ProjectID = 7
                new KanbanColumn { ProjectID = 7, UserID = 5, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 7, UserID = 5, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 7, UserID = 5, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 7, UserID = 5, Status = "Dismissed", Index = 4 },

                // For UserID = 5 and ProjectID = 8
                new KanbanColumn { ProjectID = 8, UserID = 5, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 8, UserID = 5, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 8, UserID = 5, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 8, UserID = 5, Status = "Dismissed", Index = 4 },

                // For UserID = 5 and ProjectID = 9
                new KanbanColumn { ProjectID = 9, UserID = 5, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 9, UserID = 5, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 9, UserID = 5, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 9, UserID = 5, Status = "Dismissed", Index = 4 },
                // For UserID = 6 and ProjectID = 1
                new KanbanColumn { ProjectID = 1, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 1, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 1, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 1, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 2
                new KanbanColumn { ProjectID = 2, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 2, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 2, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 2, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 3
                new KanbanColumn { ProjectID = 3, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 3, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 3, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 3, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 4
                new KanbanColumn { ProjectID = 4, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 4, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 4, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 4, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 5
                new KanbanColumn { ProjectID = 5, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 5, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 5, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 5, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 7
                new KanbanColumn { ProjectID = 7, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 7, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 7, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 7, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 8
                new KanbanColumn { ProjectID = 8, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 8, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 8, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 8, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 9
                new KanbanColumn { ProjectID = 9, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 9, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 9, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 9, UserID = 6, Status = "Dismissed", Index = 4 },

                // For UserID = 6 and ProjectID = 10
                new KanbanColumn { ProjectID = 10, UserID = 6, Status = "Planned", Index = 1 },
                new KanbanColumn { ProjectID = 10, UserID = 6, Status = "In Progress", Index = 2 },
                new KanbanColumn { ProjectID = 10, UserID = 6, Status = "Completed", Index = 3 },
                new KanbanColumn { ProjectID = 10, UserID = 6, Status = "Dismissed", Index = 4 }

            );

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    UserID = 8,
                    Username = "admin",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("admin123"),
                    FirstName = "Adminko",
                    LastName = "Adminkovic",
                    PhoneNumber = "0542948241",
                    PictureURL = "default_user.jpg",
                    Email = "admin@pmf.kg.ac.rs",
                    DateOfBirth = new DateTime(2003, 4, 20),
                    TimeRegionID = 1,
                    UserRoleID = 1,
                    Activated = 1,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 1,
                    Username = "marija_jolovic",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("marija123"),
                    FirstName = "Marija",
                    LastName = "Jolovic",
                    PhoneNumber = "0542948241",
                    PictureURL = "marija.jpg",
                    Email = "marija.jolovic@pmf.kg.ac.rs",
                    DateOfBirth = new DateTime(2003, 4, 20),
                    TimeRegionID = 1,
                    Activated = 1,
                    UserRoleID = 2,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 2,
                    Username = "danilo_novakovic",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("danilo123"),
                    FirstName = "Danilo",
                    LastName = "Novakovic",
                    PhoneNumber = "05421238244",
                    PictureURL = "danilo.jpg",
                    Email = "novakovic214146@gmail.com",
                    DateOfBirth = new DateTime(1999, 4, 21),
                    TimeRegionID = 1,
                    Activated = 1,
                    UserRoleID = 2,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 3,
                    Username = "nikola_lalic",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("nikola123"),
                    FirstName = "Nikola",
                    LastName = "Lalic",
                    PhoneNumber = "06421238244",
                    PictureURL = "nikola.jpg",
                    Email = "52-2021@pmf.kg.ac.rs",
                    DateOfBirth = new DateTime(2002, 4, 22), //  TO DO
                    TimeRegionID = 1,
                    Activated = 1,
                    UserRoleID = 2,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 4,
                    Username = "aleksandar_milutinovic",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("aleksandar123"),
                    FirstName = "Aleksandar",
                    LastName = "Milutinovic",
                    PhoneNumber = "05421238244",
                    PictureURL = "aca.jpg",
                    Email = "63-2020@pmf.kg.ac.rs",
                    DateOfBirth = new DateTime(2001, 4, 20),
                    TimeRegionID = 1,
                    Activated = 1,
                    UserRoleID = 2,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 5,
                    Username = "aleksandar_milanovic",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("aleksandar321"),
                    FirstName = "Aleksandar",
                    LastName = "Milanovic",
                    PhoneNumber = "05421238244",
                    PictureURL = "coa.jpg",
                    Email = "aleksandar2001milanovic@gmail.com",
                    DateOfBirth = new DateTime(2001, 4, 20),
                    TimeRegionID = 1,
                    Activated = 1,
                    UserRoleID = 2,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 6,
                    Username = "djordje_todorovic",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("djordje123"),
                    FirstName = "Djordje",
                    LastName = "Todorovic",
                    PhoneNumber = "05421238244",
                    PictureURL = "djordje.jpg",
                    Email = "87-2021@pmf.kg.ac.rs",
                    DateOfBirth = new DateTime(1999, 4, 20),
                    TimeRegionID = 1,
                    Activated = 1,
                    UserRoleID = 2,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                },
                new User
                {
                    UserID = 7,
                    Username = "employee",
                    Token = Guid.NewGuid().ToString(),
                    Password = _passwordHashService.HashPassword("employee123"),
                    FirstName = "Employko",
                    LastName = "Employkovic",
                    PhoneNumber = "05421238244",
                    PictureURL = "default_user.jpg",
                    Email = "employee@pmf.kg.ac.rs",
                    DateOfBirth = new DateTime(1999, 4, 20),
                    TimeRegionID = 1,
                    Activated = 1,  
                    UserRoleID = 3,
                    DarkTheme = 0,
                    Language = "en",
                    PushEmailSettings = 1,
                    PushNotificationSettings = 1
                }
            );

            // Seed ProjectRole
            modelBuilder.Entity<ProjectRole>().HasData(
                new ProjectRole { ProjectRoleID = 1, ProjectRoleName = "uloga1" },
                new ProjectRole { ProjectRoleID = 2, ProjectRoleName = "uloga2" }
                
            );

            // Seed Project
            modelBuilder.Entity<Project>().HasData(
                new Project
                {
                    ProjectID = 1,
                    ProjectName = "Project Alpha",
                    Description = "Development of a new mobile app for task management.",
                    Status = "In Progress",
                    StartDate = new DateTime(2024, 03, 05),
                    EndDate = new DateTime(2024, 05, 20),
                    ProjectLeaderID = 1
                },
                new Project
                {
                    ProjectID = 2,
                    ProjectName = "Marketing Campaign Revamp",
                    Description = "Overhaul of marketing strategies and materials.",
                    Status = "In Progress",
                    StartDate = new DateTime(2024, 02, 10),
                    EndDate = new DateTime(2024, 04, 30),
                    ProjectLeaderID = 1

                },
                new Project
                {
                    ProjectID = 3,
                    ProjectName = "Website Redesign",
                    Description = "Modernization and improvement of company website.",
                    Status = "In Progress",
                    StartDate = new DateTime(2024, 01, 15),
                    EndDate = new DateTime(2024, 03, 31),
                    ProjectLeaderID = 2
                },
                new Project
                {
                    ProjectID = 4,
                    ProjectName = "Product Launch - XYZ",
                    Description = "Launching a new product line into the market.",
                    Status = "In Progress",
                    StartDate = new DateTime(2024, 04, 01),
                    EndDate = new DateTime(2024, 06, 30),
                    ProjectLeaderID = 2
                },
                new Project
                {
                    ProjectID = 5,
                    ProjectName = "Employee Training Program",
                    Description = "Implementation of a comprehensive training program for staff development.",
                    Status = "Planned",
                    StartDate = new DateTime(2024, 03, 01),
                    EndDate = new DateTime(2024, 04, 11),
                    ProjectLeaderID = 3
                },
                new Project
                {
                    ProjectID = 6,
                    ProjectName = "Infrastructure Upgrade",
                    Description = "Upgrading company's IT infrastructure for improved efficiency and security.",
                    Status = "Planned",
                    StartDate = new DateTime(2024, 02, 20),
                    EndDate = new DateTime(2024, 05, 15),
                    ProjectLeaderID = 4
                },
                new Project
                {
                    ProjectID = 7,
                    ProjectName = "Customer Feedback Analysis",
                    Description = "Analyzing customer feedback to enhance product/service quality.",
                    Status = "Completed",
                    StartDate = new DateTime(2024, 01, 05),
                    EndDate = new DateTime(2024, 03, 31),
                    ProjectLeaderID = 4
                },
                new Project
                {
                    ProjectID = 8,
                    ProjectName = "Expansion into New Markets",
                    Description = "Research and entry into new geographical markets.",
                    Status = "Completed",
                    StartDate = new DateTime(2024, 03, 10),
                    EndDate = new DateTime(2024, 06, 30),
                    ProjectLeaderID = 5
                },
                new Project
                {
                    ProjectID = 9,
                    ProjectName = "Green Initiative Implementation",
                    Description = "Implementation of eco-friendly practices within the organization.",
                    Status = "Dismissed",
                    StartDate = new DateTime(2024, 04, 01),
                    EndDate = new DateTime(2024, 04, 11),
                    ProjectLeaderID = 6
                },
                new Project
                {
                    ProjectID = 10,
                    ProjectName = "Financial System Optimization",
                    Description = "Streamlining financial processes and systems for better efficiency.",
                    Status = "Completed",
                    StartDate = new DateTime(2024, 02, 01),
                    EndDate = new DateTime(2024, 04, 30),
                    ProjectLeaderID = 6
                }
            // Add more Project entries as needed
            );

            // Seed User_Project
            modelBuilder.Entity<User_Project>().HasData(
                new User_Project { UserID = 2, ProjectID = 1},
                new User_Project { UserID = 3, ProjectID = 1},
                new User_Project { UserID = 1, ProjectID = 1},
                new User_Project { UserID = 5, ProjectID = 1},
                new User_Project { UserID = 6, ProjectID = 1},
                new User_Project { UserID = 1, ProjectID = 2},
                new User_Project { UserID = 2, ProjectID = 2},
                new User_Project { UserID = 3, ProjectID = 2},
                new User_Project { UserID = 4, ProjectID = 2},
                new User_Project { UserID = 6, ProjectID = 2},
               
                new User_Project { UserID = 2, ProjectID = 3},
                new User_Project { UserID = 5, ProjectID = 3},
                new User_Project { UserID = 6, ProjectID = 3},
                new User_Project { UserID = 4, ProjectID = 3},
                new User_Project { UserID = 2, ProjectID = 4},
                new User_Project { UserID = 3, ProjectID = 4},
                new User_Project { UserID = 4, ProjectID = 4},
                new User_Project { UserID = 5, ProjectID = 4},
                new User_Project { UserID = 6, ProjectID = 4},
                new User_Project { UserID = 1, ProjectID = 5},
                new User_Project { UserID = 2, ProjectID = 5},
                new User_Project { UserID = 3, ProjectID = 5},
                new User_Project { UserID = 6, ProjectID = 5},
                new User_Project { UserID = 4, ProjectID = 5},
                new User_Project { UserID = 2, ProjectID = 6},
                new User_Project { UserID = 3, ProjectID = 6},
                new User_Project { UserID = 4, ProjectID = 6},
                new User_Project { UserID = 4, ProjectID = 7},
                new User_Project { UserID = 5, ProjectID = 7},
                new User_Project { UserID = 6, ProjectID = 7},
                new User_Project { UserID = 2, ProjectID = 8},
                new User_Project { UserID = 5, ProjectID = 8},
                new User_Project { UserID = 6, ProjectID = 8},
                new User_Project { UserID = 1, ProjectID = 9},
                new User_Project { UserID = 4, ProjectID = 9},
                new User_Project { UserID = 5, ProjectID = 9},
                new User_Project { UserID = 6, ProjectID = 9},
                new User_Project { UserID = 2, ProjectID = 10},
                new User_Project { UserID = 3, ProjectID = 10},
                new User_Project { UserID = 6, ProjectID = 10}
            );

            // Seed AssignmentList
            modelBuilder.Entity<AssignmentList>().HasData(
                new AssignmentList { AssignmentListID = 1, AssignmentListName = "UI Development", Description = "Tasks related to user interface development.", ProjectID = 1 },
                new AssignmentList { AssignmentListID = 2, AssignmentListName = "Backend Implementation", Description = "Tasks related to backend logic implementation.", ProjectID = 1 },
                new AssignmentList { AssignmentListID = 3, AssignmentListName = "Marketing Material Update", Description = "Tasks related to updating marketing materials.", ProjectID = 2 },
                new AssignmentList { AssignmentListID = 4, AssignmentListName = "Product Research", Description = "Tasks related to conducting product research and surveys.", ProjectID = 4 },
                new AssignmentList { AssignmentListID = 5, AssignmentListName = "Customer Support", Description = "Tasks related to customer support and inquiries.", ProjectID = 5 },
                new AssignmentList { AssignmentListID = 6, AssignmentListName = "Quality Assurance", Description = "Tasks related to quality assurance and testing.", ProjectID = 5 },
                new AssignmentList { AssignmentListID = 7, AssignmentListName = "Content Creation", Description = "Tasks related to creating content for the project.", ProjectID = 6 },
                new AssignmentList { AssignmentListID = 8, AssignmentListName = "Market Analysis", Description = "Tasks related to analyzing the market trends.", ProjectID = 6 },
                new AssignmentList { AssignmentListID = 9, AssignmentListName = "Financial Planning", Description = "Tasks related to financial planning and budgeting.", ProjectID = 7 },
                new AssignmentList { AssignmentListID = 10, AssignmentListName = "Supply Chain Management", Description = "Tasks related to managing the supply chain.", ProjectID = 7 },
                new AssignmentList { AssignmentListID = 11, AssignmentListName = "Event Coordination", Description = "Tasks related to coordinating project events.", ProjectID = 8 },
                new AssignmentList { AssignmentListID = 12, AssignmentListName = "Public Relations", Description = "Tasks related to managing public relations for the project.", ProjectID = 8 },
                new AssignmentList { AssignmentListID = 13, AssignmentListName = "Legal Compliance", Description = "Tasks related to ensuring legal compliance.", ProjectID = 9 },
                new AssignmentList { AssignmentListID = 14, AssignmentListName = "Training and Development", Description = "Tasks related to employee training and development.", ProjectID = 9 },
                new AssignmentList { AssignmentListID = 15, AssignmentListName = "Mobile App Development", Description = "Tasks related to developing a mobile application.", ProjectID = 10 },
                new AssignmentList { AssignmentListID = 16, AssignmentListName = "User Testing", Description = "Tasks related to user testing and feedback collection.", ProjectID = 10 }

            // Add more assignment lists as needed
            );
            // Seed Assignment
            modelBuilder.Entity<Assignment>().HasData(
                new Assignment { AssignmentID = 1, AssignmentName = "Develop User Interface", AssignmentLeadID = 1, Description = "Design and implement UI for mobile app.", Status = "In Progress", Priority = "Low", CreationDate = new DateTime(2023, 4, 15, 10, 0, 0), Deadline = DateTime.Now.AddDays(14), CompletionTime=DateTime.Now,AssignmentListID = 1 , Progress = 0},
                new Assignment { AssignmentID = 2, AssignmentName = "Implement Backend Logic", AssignmentLeadID = 6, Description = "Develop backend functionalities for the mobile app.", Status = "Completed", Priority = "Medium", CreationDate = new DateTime(2024, 4, 15, 10, 0, 0), Deadline = DateTime.Now.AddDays(21), CompletionTime = DateTime.Now, ParentAssignmentID = 1,  AssignmentListID = 2, Progress = 20 },
                new Assignment { AssignmentID = 3, AssignmentName = "Update Marketing Material", AssignmentLeadID = 4, Description = "Revise existing marketing materials for the campaign.", Status = "In Progress", Priority = "High", CreationDate = new DateTime(2024, 2, 15, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 3, Progress = 0 },
                new Assignment { AssignmentID = 4, AssignmentName = "Optimize Website Performance", AssignmentLeadID = 4, Description = "Analyze and improve website loading speed and user experience.", Status = "Dismissed", Priority = "Low", CreationDate = new DateTime(2024, 4, 10, 10, 0, 0), Deadline = DateTime.Now.AddDays(30),  AssignmentListID = 3, Progress = 0 },
                new Assignment { AssignmentID = 5, AssignmentName = "Conduct Product Survey", AssignmentLeadID = 6, Description = "Gather feedback from potential customers regarding the new product.", Status = "Planned", Priority = "Medium", CreationDate = new DateTime(2024, 4, 8, 10, 0, 0), Deadline = DateTime.Now.AddDays(7),  AssignmentListID = 4, Progress = 0 },
                new Assignment { AssignmentID = 6, AssignmentName = "Develop Marketing Strategy", AssignmentLeadID = 2, Description = "Create a comprehensive marketing strategy for the new campaign.", Status = "In Progress", Priority = "High", CreationDate = new DateTime(2024, 3, 15, 10, 0, 0), Deadline = DateTime.Now.AddDays(15), AssignmentListID = 3, Progress = 0 },
                new Assignment { AssignmentID = 7, AssignmentName = "Design Advertisements", AssignmentLeadID = 2, Description = "Design eye-catching advertisements for the new campaign.", Status = "Planned", Priority = "Medium", CreationDate = new DateTime(2024, 4, 12, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 3 , Progress = 0 },
                new Assignment { AssignmentID = 8, AssignmentName = "Analyze Website Traffic", AssignmentLeadID = 4, Description = "Analyze website traffic data to identify trends and insights.", Status = "In Progress", Priority = "Medium", CreationDate = new DateTime(2024, 2, 26, 10, 0, 0), Deadline = DateTime.Now.AddDays(20), AssignmentListID = 3, Progress = 0 },
                new Assignment { AssignmentID = 9, AssignmentName = "Prepare Training Material", AssignmentLeadID = 2, Description = "Prepare training material for the upcoming employee training program.", Status = "Planned", Priority = "Low", CreationDate = new DateTime(2024, 4, 16, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 4, Progress = 0 },
                new Assignment { AssignmentID = 10, AssignmentName = "Conduct Staff Survey", AssignmentLeadID = 3, Description = "Conduct a survey to gather feedback from employees regarding training needs.", Status = "Planned", Priority = "Low", CreationDate = new DateTime(2024, 4, 25, 10, 0, 0), Deadline = DateTime.Now.AddDays(7), AssignmentListID = 4, Progress = 0 },
                new Assignment { AssignmentID = 11, AssignmentName = "Update Project Documentation", AssignmentLeadID = 2, Description = "Update project documentation with the latest changes and progress.", Status = "In Progress", Priority = "Medium", CreationDate = new DateTime(2024, 3, 25, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), CompletionTime = new DateTime(2024, 3, 25, 12, 0, 0), ParentAssignmentID = 1, AssignmentListID = 1, Progress = 0 },
                new Assignment { AssignmentID = 12, AssignmentName = "Test New Feature", AssignmentLeadID = 5, Description = "Test the functionality of the new feature on the mobile app.", Status = "In Progress", Priority = "High", CreationDate = DateTime.Now, Deadline = DateTime.Now.AddDays(7), AssignmentListID = 2, Progress = 0 },
                new Assignment { AssignmentID = 13, AssignmentName = "Review Marketing Campaign Results", AssignmentLeadID = 2, Description = "Review the results of the marketing campaign and make necessary adjustments.", Status = "Planned", Priority = "Medium", CreationDate = DateTime.Now, Deadline = DateTime.Now.AddDays(15), AssignmentListID = 3, Progress = 0 },
                new Assignment { AssignmentID = 14, AssignmentName = "Conduct Product Demo", AssignmentLeadID = 5, Description = "Conduct a live demonstration of the new product to potential clients.", Status = "Planned", Priority = "High", CreationDate = DateTime.Now, Deadline = DateTime.Now.AddDays(10), AssignmentListID = 4, Progress = 0 },
                //new Assignment { AssignmentID = 15, AssignmentName = "Update Company Policies", AssignmentLeadID = 2, Description = "Update company policies to reflect recent changes and developments.", Status = "In Progress", Priority = "Low", CreationDate = DateTime.Now, Deadline = DateTime.Now.AddDays(20), AssignmentListID = 1 },
                new Assignment { AssignmentID = 17, AssignmentName = "Setup Helpdesk System", AssignmentLeadID = 1, Description = "Implement a helpdesk system for customer support.", Status = "Planned", Priority = "Medium", CreationDate = new DateTime(2024, 4, 1, 10, 0, 0), Deadline = DateTime.Now.AddDays(14), AssignmentListID = 5, Progress = 0 },
                new Assignment { AssignmentID = 18, AssignmentName = "Train Customer Support Team", AssignmentLeadID = 3, Description = "Provide training sessions for the customer support team.", Status = "Planned", Priority = "High", CreationDate = new DateTime(2024, 4, 5, 10, 0, 0), Deadline = DateTime.Now.AddDays(21), AssignmentListID = 13, Progress = 0 },
                new Assignment { AssignmentID = 19, AssignmentName = "Create Support Documentation", AssignmentLeadID = 1, Description = "Prepare documentation for common customer queries.", Status = "In Progress", Priority = "Low", CreationDate = new DateTime(2024, 4, 8, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 14, Progress = 0 },
                //new Assignment { AssignmentID = 20, AssignmentName = "Monitor Support Tickets", AssignmentLeadID = 1, Description = "Monitor and resolve customer support tickets.", Status = "In Progress", Priority = "Medium", CreationDate = new DateTime(2024, 4, 12, 10, 0, 0), Deadline = DateTime.Now.AddDays(30), AssignmentListID = 5, Progress = 0 }
                new Assignment { AssignmentID = 21, AssignmentName = "Perform System Testing", AssignmentLeadID = 5, Description = "Perform rigorous testing of the system for quality assurance.", Status = "Planned", Priority = "High", CreationDate = new DateTime(2024, 4, 2, 10, 0, 0), Deadline = DateTime.Now.AddDays(14), AssignmentListID = 6, Progress = 0 },
                new Assignment { AssignmentID = 22, AssignmentName = "Implement Security Measures", AssignmentLeadID = 1, Description = "Implement additional security measures for the system.", Status = "In Progress", Priority = "Medium", CreationDate = new DateTime(2024, 4, 6, 10, 0, 0), Deadline = DateTime.Now.AddDays(21), AssignmentListID = 6, Progress = 0 }
                // new Assignment { AssignmentID = 23, AssignmentName = "Create User Guides", AssignmentLeadID = 4, Description = "Prepare user guides for system functionalities.", Status = "In Progress", Priority = "Low", CreationDate = new DateTime(2024, 4, 10, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 6 },
                // new Assignment { AssignmentID = 24, AssignmentName = "Review System Performance", AssignmentLeadID = 5, Description = "Review and optimize system performance.", Status = "In Progress", Priority = "Medium", CreationDate = new DateTime(2024, 4, 14, 10, 0, 0), Deadline = DateTime.Now.AddDays(30), AssignmentListID = 6 },
                // new Assignment { AssignmentID = 25, AssignmentName = "Create Social Media Posts", AssignmentLeadID = 3, Description = "Prepare engaging posts for social media platforms.", Status = "Planned", Priority = "Low", CreationDate = new DateTime(2024, 4, 3, 10, 0, 0), Deadline = DateTime.Now.AddDays(14), AssignmentListID = 7 },
                // new Assignment { AssignmentID = 26, AssignmentName = "Analyze Competitor Strategies", AssignmentLeadID = 4, Description = "Study competitor strategies and market trends.", Status = "In Progress", Priority = "Medium", CreationDate = new DateTime(2024, 4, 7, 10, 0, 0), Deadline = DateTime.Now.AddDays(21), AssignmentListID = 7 },
                // new Assignment { AssignmentID = 27, AssignmentName = "Prepare Promotional Videos", AssignmentLeadID = 6, Description = "Create promotional videos for the campaign.", Status = "In Progress", Priority = "High", CreationDate = new DateTime(2024, 4, 11, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 7 },
                // new Assignment { AssignmentID = 28, AssignmentName = "Monitor Campaign Performance", AssignmentLeadID = 2, Description = "Monitor and analyze the performance of marketing campaigns.", Status = "Planned", Priority = "Medium", CreationDate = new DateTime(2024, 4, 15, 10, 0, 0), Deadline = DateTime.Now.AddDays(30), AssignmentListID = 7 },
                // new Assignment { AssignmentID = 29, AssignmentName = "Review Market Research Data", AssignmentLeadID = 4, Description = "Analyze data from market research for insights.", Status = "Planned", Priority = "Medium", CreationDate = new DateTime(2024, 4, 4, 10, 0, 0), Deadline = DateTime.Now.AddDays(14), AssignmentListID = 8 },
                // new Assignment { AssignmentID = 30, AssignmentName = "Create Ad Campaigns", AssignmentLeadID = 2, Description = "Design and launch online ad campaigns.", Status = "In Progress", Priority = "High", CreationDate = new DateTime(2024, 4, 8, 10, 0, 0), Deadline = DateTime.Now.AddDays(21), AssignmentListID = 8 },
                // new Assignment { AssignmentID = 31, AssignmentName = "Prepare Press Releases", AssignmentLeadID = 3, Description = "Draft press releases for product announcements.", Status = "In Progress", Priority = "Low", CreationDate = new DateTime(2024, 4, 12, 10, 0, 0), Deadline = DateTime.Now.AddDays(10), AssignmentListID = 8 },
                // new Assignment { AssignmentID = 32, AssignmentName = "Coordinate Influencer Collaborations", AssignmentLeadID = 6, Description = "Collaborate with influencers for brand promotions.", Status = "Planned", Priority = "Medium", CreationDate = new DateTime(2024, 4, 16, 10, 0, 0), Deadline = DateTime.Now.AddDays(30), AssignmentListID = 8 }
            );

            // Seed Comment
            modelBuilder.Entity<Comment>().HasData(
                new Comment { CommentID = 1, CommentText = "Comment 1", CreationDate = DateTime.Now, UserID = 1, AssignmentID = 1 },
                new Comment { CommentID = 2, CommentText = "Another comment", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 1 },
                new Comment { CommentID = 3, CommentText = "Feedback received", CreationDate = DateTime.Now, UserID = 3, AssignmentID = 2 },
               // new Comment { CommentID = 4, CommentText = "Important note", CreationDate = DateTime.Now, UserID = 1, AssignmentID = 2 },
                new Comment { CommentID = 5, CommentText = "Clarification needed", CreationDate = DateTime.Now, UserID = 4, AssignmentID = 3 },
               // new Comment { CommentID = 6, CommentText = "Update required", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 3 },
                //new Comment { CommentID = 7, CommentText = "Completed task", CreationDate = DateTime.Now, UserID = 3, AssignmentID = 4 },
                new Comment { CommentID = 8, CommentText = "Issue resolved", CreationDate = DateTime.Now, UserID = 4, AssignmentID = 4 },
                new Comment { CommentID = 9, CommentText = "Progress update", CreationDate = DateTime.Now, UserID = 4, AssignmentID = 5 },
                // new Comment { CommentID = 10, CommentText = "Deadline extended", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 5 },
                new Comment { CommentID = 11, CommentText = "Request for information", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 6 },
               // new Comment { CommentID = 12, CommentText = "Approval needed", CreationDate = DateTime.Now, UserID = 4, AssignmentID = 6 },
                new Comment { CommentID = 13, CommentText = "Error detected", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 7 },
                new Comment { CommentID = 14, CommentText = "Resource allocation request", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 7 },
                new Comment { CommentID = 15, CommentText = "Revision requested", CreationDate = DateTime.Now, UserID = 4, AssignmentID = 8 },
                new Comment { CommentID = 16, CommentText = "Update on project status", CreationDate = DateTime.Now, UserID = 4, AssignmentID = 8 },
                new Comment { CommentID = 17, CommentText = "Training material uploaded", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 9 },
                new Comment { CommentID = 18, CommentText = "Bug fix in progress", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 9 },
                new Comment { CommentID = 19, CommentText = "Meeting scheduled", CreationDate = DateTime.Now, UserID = 3, AssignmentID = 10 },
                new Comment { CommentID = 20, CommentText = "Documentation updated", CreationDate = DateTime.Now, UserID = 3, AssignmentID = 10 },
                new Comment { CommentID = 21, CommentText = "Budget approval pending", CreationDate = DateTime.Now, UserID = 2, AssignmentID = 11 }
            );

            // Seed User_Assignment
            modelBuilder.Entity<User_Assignment>().HasData(
                // Assignments assigned to users
                new User_Assignment { UserID = 2, AssignmentID = 1, Type = 0 },
                new User_Assignment { UserID = 3, AssignmentID = 1 , Type = 0 },
                new User_Assignment { UserID = 2, AssignmentID = 2 , Type = 0 },
                new User_Assignment { UserID = 3, AssignmentID = 2  , Type = 0 },
                new User_Assignment { UserID = 4, AssignmentID = 3 , Type = 0 },
                new User_Assignment { UserID = 6, AssignmentID = 3 , Type = 0 },
                new User_Assignment { UserID = 2, AssignmentID = 4 , Type = 0 },
                new User_Assignment { UserID = 6, AssignmentID = 4 , Type = 0 },
                new User_Assignment { UserID = 3, AssignmentID = 5 , Type = 0 },
                new User_Assignment { UserID = 4, AssignmentID = 5 , Type = 0 },
                new User_Assignment { UserID = 1, AssignmentID = 17 , Type = 0 },
                new User_Assignment { UserID = 4, AssignmentID = 17 , Type = 0 },
                new User_Assignment { UserID = 6, AssignmentID = 17 , Type = 0 },
                new User_Assignment { UserID = 1, AssignmentID = 18 , Type = 0 },
                new User_Assignment { UserID = 4, AssignmentID = 18 , Type = 0 },
                new User_Assignment { UserID = 5, AssignmentID = 18 , Type = 0 },
                new User_Assignment { UserID = 1, AssignmentID = 19 , Type = 0 },
                new User_Assignment { UserID = 5, AssignmentID = 19 , Type = 0 },
                new User_Assignment { UserID = 1, AssignmentID = 21 , Type = 0 },
                new User_Assignment { UserID = 4, AssignmentID = 21 , Type = 0 },
                new User_Assignment { UserID = 6, AssignmentID = 21 , Type = 0 },
                new User_Assignment { UserID = 1, AssignmentID = 22 , Type = 0 },
                new User_Assignment { UserID = 2, AssignmentID = 22 , Type = 0 },
                new User_Assignment { UserID = 4, AssignmentID = 22 , Type = 0 }

            );
        }
    }
}
