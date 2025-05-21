using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Comment
{
    public class CreateCommentDTO
    {
        public string? CommentText { get; set; }
        public DateTime? CreationDate { get; set; }
        public int? UserID { get; set; }
        public int? AssignmentID { get; set; }
    }
}
