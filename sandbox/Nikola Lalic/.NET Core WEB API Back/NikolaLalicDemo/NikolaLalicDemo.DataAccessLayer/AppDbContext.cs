using Microsoft.EntityFrameworkCore;
using NikolaLalicDemo.Models;
using System.Collections.Generic;

namespace NikolaLalicDemo.DataAccessLayer
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}
        public DbSet<User> Users { get; set; }
    }
}
