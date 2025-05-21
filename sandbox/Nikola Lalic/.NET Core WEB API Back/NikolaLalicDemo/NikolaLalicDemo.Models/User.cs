using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NikolaLalicDemo.Models
{
    public class User
    {
        [Key]
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
