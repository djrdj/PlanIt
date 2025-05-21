using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.User
{
    public class ImageUploadModel
    {
        public int UserId { get; set; }
        public IFormFile ImageFile { get; set; }
    }
}
