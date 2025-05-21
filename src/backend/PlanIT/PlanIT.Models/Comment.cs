using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class Comment
    {
        [Key]
        public int CommentID { get; set; }
        public string CommentText { get; set; }
        public DateTime CreationDate { get; set; }
        public int UserID { get; set; }
        public User User { get; set; }
        public int AssignmentID { get; set; }
        public Assignment Assignment { get; set; }
        public string? AttachmentPath { get; set; }

    }
}
