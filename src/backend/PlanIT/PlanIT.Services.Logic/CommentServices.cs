using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PlanIT.DataAccessLayer;
using PlanIT.DataTransferModel.Comment;
using PlanIT.Logging;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    public class CommentServices : ICommentServices
    {
        public ILoggger Logger { get; }
        public ApplicationDbContext Context { get; }
        public INotificationServices _notificationService;

        public CommentServices(ApplicationDbContext mContext, ILoggger loger, INotificationServices notificationService)
        {
            Logger = loger;
            Context = mContext;
            _notificationService = notificationService;
        }
        public async Task AddCommentAsync(Comment comment)
        {
            Logger.LogInformation($"Called: {nameof(AddCommentAsync)} from CommentServices");
            try
            {
                Context.Comments.Add(comment);
                await _notificationService.TriggerCommentNotification(comment.AssignmentID, comment.UserID, NotificationType.Comment);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(AddCommentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteCommentAsync(int CommentID)
        {
            Logger.LogInformation($"Called: {nameof(DeleteCommentAsync)} from CommentServices");
            try
            {
                var existingComment = await Context.Comments.FirstOrDefaultAsync(x => x.CommentID == CommentID);

                if (existingComment == null)
                    return;

                Context.Comments.Remove(existingComment);
                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(DeleteCommentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Comment>> GetAllCommentsAsync()
        {
            Logger.LogInformation($"Called: {nameof(GetAllCommentsAsync)} from CommentServices");
            try
            {
                return await Context.Comments.ToListAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetAllCommentsAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<Comment> GetCommentByID(int CommentID)
        {
            Logger.LogInformation($"Called: {nameof(GetCommentByID)} with CommentID: {CommentID} from CommentServices");
            try
            {
                return await Context.Comments.FirstOrDefaultAsync(x => x.CommentID == CommentID) ?? throw new Exception("Comment not found");
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(GetCommentByID)}: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateCommentAsync(Comment comment, int CommentID)
        {
            Logger.LogInformation($"Called: {nameof(UpdateCommentAsync)} from CommentServices");

            try
            {
                var existingComment = await Context.Comments.FirstOrDefaultAsync(x => x.CommentID == CommentID);
                if (existingComment == null)
                    return;

                existingComment.CommentText = comment.CommentText;


                await Context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UpdateCommentAsync)}: {ex.Message}");
                throw;
            }
        }

        public async Task<string> UploadAttachment(IFormFile file,int CommentID)
        {
            Logger.LogInformation($"Called: {nameof(UploadAttachment)} from CommentServices");

            try
            {
                var existingComment = await Context.Comments.FirstOrDefaultAsync(x => x.CommentID == CommentID);

                if (existingComment == null)
                    return "no comment found";

                string extension = Path.GetExtension( file.FileName );
                long size = file.Length;
                if (size > (5 * 1024 * 1024))
                    return "Maxsimum size is 5mb";
                string fileName = Guid.NewGuid().ToString()+extension;
                string path = Path.Combine(Directory.GetCurrentDirectory(), fileName);
                using FileStream stream = new FileStream(path + fileName, FileMode.Create);
                file.CopyToAsync(stream);
                existingComment.AttachmentPath = path;
                await Context.SaveChangesAsync();
                return fileName;
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(UploadAttachment)}: {ex.Message}");
                throw;
            }
        }

        public async Task<byte[]> DownloadAttachmentAsync(string filePath)
        {
            Logger.LogInformation($"Called: {nameof(DownloadAttachmentAsync)} from CommentServices");
            try
            {
                if (string.IsNullOrEmpty(filePath))
                    throw new ArgumentException("File path is required");

                if (!File.Exists(filePath))
                    throw new FileNotFoundException("File not found", filePath);

                return await File.ReadAllBytesAsync(filePath);
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error in {nameof(DownloadAttachmentAsync)}: {ex.Message}");
                throw;
            }
        }
    }
}
