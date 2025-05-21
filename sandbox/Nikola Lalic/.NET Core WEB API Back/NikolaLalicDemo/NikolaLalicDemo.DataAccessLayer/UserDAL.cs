using NikolaLalicDemo.Models;
using SQLitePCL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NikolaLalicDemo.DataAccessLayer
{
    public class UserDAL
    {
        AppDbContext adc;
        public UserDAL(AppDbContext modelsContext) 
        { 
            adc=modelsContext;
        }

        public List<User> GetAllUsers()
        {
            return adc.Users.ToList();
        }
    }
}
