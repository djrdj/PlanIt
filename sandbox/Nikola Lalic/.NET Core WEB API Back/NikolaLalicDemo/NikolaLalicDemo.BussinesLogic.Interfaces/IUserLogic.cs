using NikolaLalicDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NikolaLalicDemo.BussinesLogic.Interfaces
{
    public interface IUserLogic
    {
        User GetUserByLogIn(string username, string password);

    }
}
