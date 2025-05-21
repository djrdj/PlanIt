using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Comment
{
    public class GetCommentDTO
    {
        public int? CommentID { get; set; }
        public string? CommentText { get; set; }
        public DateTime? CreationDate { get; set; }
        public int? UserID { get; set; }
        public int? AssignmentID { get; set; }
        public string? AttachmentPath { get; set; }
    }
}
