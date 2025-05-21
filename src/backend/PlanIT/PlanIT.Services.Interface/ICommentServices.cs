using Microsoft.AspNetCore.Http;
using PlanIT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Interface
{
    public interface ICommentServices
    {
        Task<List<Comment>> GetAllCommentsAsync();
        Task<Comment> GetCommentByID(int CommentID);
        Task AddCommentAsync(Comment comment);
        Task DeleteCommentAsync(int CommentID);
        Task UpdateCommentAsync(Comment comment, int CommentID);
        Task<string> UploadAttachment(IFormFile file, int commentID);
        Task<byte[]> DownloadAttachmentAsync(string filePath);
    }
}
