using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PlanIT.Models;

namespace PlanIT.DataTransferModel.User {
    public class UserWithCountDTO {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PictureURL { get; set; }
        public int Count { get; set; }
    }
}
