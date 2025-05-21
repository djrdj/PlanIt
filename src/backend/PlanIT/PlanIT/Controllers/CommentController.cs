using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.Comment;
using PlanIT.Logging;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;

namespace PlanIT.API.Controllers
{
    [Route("api/comment")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        public ICommentServices CommentService { get; }
        private readonly ILoggger loggger;
        public CommentController(ILoggger loger, ICommentServices cLogic)
        {
            loggger = loger;
            CommentService = cLogic;
        }
        [HttpGet]
        public async Task<List<GetCommentDTO>> GetComments()
        {
            loggger.LogInformation($"Called {nameof(GetComments)} from CommentController");
            var comment = await CommentService.GetAllCommentsAsync();

            return comment.Select(CommentMapper.ToDto).ToList();
        }

        [HttpGet("{commentID}")]
        public async Task<GetCommentDTO?> Get(int commentID)
        {
            loggger.LogInformation($"Called {nameof(Get)} from CommentController");
            var comment = await CommentService.GetCommentByID(commentID);

            return comment?.ToDto();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateCommentDTO createCommentDTO)
        {
            loggger.LogInformation($"Called {nameof(CreateCommentDTO)} from CommentController");

            try
            {
                await CommentService.AddCommentAsync(createCommentDTO.FromDto());
                return Ok(new { Message = "Comment added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(Post)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [HttpDelete("{commentID}")]
        public async Task Delete(int commentID)
        {
            loggger.LogInformation($"Called {nameof(Delete)} from CommentController");
            await CommentService.DeleteCommentAsync(commentID);
        }

        [HttpPut("{commentID}")]
        public async Task Put(int commentID, [FromBody] UpdateCommentDTO updateCommentDTO)
        {
            loggger.LogInformation($"Called {nameof(updateCommentDTO)} from CommentController");
            await CommentService.UpdateCommentAsync(updateCommentDTO.FromDto(), commentID);

        }

        [HttpPut("UploadAttachment")]
        public async Task<IActionResult> UploadAttachment(IFormFile file, int commentID)
        {
            loggger.LogInformation($"Called {UploadAttachment} from CommentController");

            try
            {
                await CommentService.UploadAttachment(file, commentID);
                return Ok(new { Message = "Attachment added successfully" });
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(UploadAttachment)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [HttpGet("DownloadAttachment")]
        public async Task<IActionResult> DownloadAttachment(string filePath)
        {
            loggger.LogInformation($"Called {DownloadAttachment} from CommentController");

            try
            {
                var fileBytes = await CommentService.DownloadAttachmentAsync(filePath);
                var contentType = "application/octet-stream";
                var fileName = Path.GetFileName(filePath);

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                loggger.LogError($"Error in {nameof(DownloadAttachment)}: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


    }
}
