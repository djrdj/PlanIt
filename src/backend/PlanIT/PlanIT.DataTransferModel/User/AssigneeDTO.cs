using Org.BouncyCastle.Bcpg;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class AssigneeDTO
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string PictureURL { get; set; }
        public int Type { get; set; }
    }
}
