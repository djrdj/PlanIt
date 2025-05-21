using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Comment
{
    public class CommentDTO
    {
        public int CommentID { get; set; }
        public string Username { get; set; }
        public string UserPictureURL { get; set; }
        public string CommentText { get; set; }
        public DateTime CreationDate { get; set; }
        public int UserID { get; set; }
    }
}
