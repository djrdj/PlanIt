using PlanIT.DataTransferModel.AssignmentList;
using PlanIT.DataTransferModel.Comment;
using PlanIT.Models;

namespace PlanIT.API.Mappers
{
    public static class CommentMapper
    {
        public static GetCommentDTO ToDto(this Comment comment) => new()
        {
            CommentID = comment.CommentID,
            CommentText = comment.CommentText,
            CreationDate = comment.CreationDate,
            UserID = comment.UserID,
            AssignmentID = comment.AssignmentID,
            AttachmentPath = comment.AttachmentPath
        };

        public static Comment FromDto(this CreateCommentDTO dto) => new()
        {
            CommentText = dto.CommentText,
            CreationDate = (DateTime)dto.CreationDate,
            UserID = (int)dto.UserID,
            AssignmentID = (int)dto.AssignmentID,
            
        };
        public static Comment FromDto(this UpdateCommentDTO dto) => new()
        {
            CommentText = dto.CommentText
        };
    }
}
