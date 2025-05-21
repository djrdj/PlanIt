using PlanIT.DataTransferModel.Comment;
using PlanIT.DataTransferModel.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.Assignment
{
    public class GetAssignmentWithCommentsDTO
    {
        public int AssignmentID { get; set; }
        public string AssignmentName { get; set; }
        public string ProjectName { get; set; }
        public int ProjectID { get; set; }
        public string Status { get; set; }
        public int AssignmentLeadID {  get; set; }
        public int AssignmentListID {  get; set; }
        public string AssignmentListName { get; set; }
        public int Progress {  get; set; }
        public string AssignmentPriority { get; set; }
        public int? ParentAssignmentID { get; set; }
        public string ParentAssignmentName { get; set; }
        public string AssignmentLeaderUsername { get; set; }
        public string AssignmentLeaderPictureURL { get; set; }
        public string AssignmentLeaderFirstName { get; set; }
        public string AssignmentLeaderLastName { get; set; }
        public List<AssigneeDTO> AssignedUsers { get; set; }
        public DateTime AssignmentCreationDate { get; set; }
        public DateTime AssignmentDeadLine { get; set; }
        public string AssignmentDescription { get; set; }
        public List<CommentDTO> Comments { get; set; }
    }
}
