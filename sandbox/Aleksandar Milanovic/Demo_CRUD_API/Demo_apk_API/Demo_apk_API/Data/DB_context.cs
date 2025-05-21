using Demo_apk_API.Models;
using Microsoft.EntityFrameworkCore;

namespace Demo_apk_API.Data
{
    public class DB_context: DbContext
    {
        public DB_context(DbContextOptions options):base(options) { 
        

        }


        public DbSet<Employee> Employees { get; set; } 
    }
}
