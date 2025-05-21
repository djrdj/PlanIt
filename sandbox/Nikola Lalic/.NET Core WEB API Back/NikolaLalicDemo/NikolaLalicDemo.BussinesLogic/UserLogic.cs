using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NikolaLalicDemo.BussinesLogic.Interfaces;
using NikolaLalicDemo.DataAccessLayer;
using NikolaLalicDemo.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NikolaLalicDemo.BussinesLogic
{
    public class UserLogic : IUserLogic
    {
        private UserDAL _userDAL;
        public UserLogic(UserDAL mContext)
        {
            _userDAL = mContext;
        }
        public User GetUserByLogIn(string username, string password)
        {
            try
            {
                var users = _userDAL.GetAllUsers();
                return users.FirstOrDefault(x => x.Username == username && x.Password == password);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                throw;
            }
        }


    }
}
