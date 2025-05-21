using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlanIT.API.Mappers;
using PlanIT.DataTransferModel.UserAssignment;
using PlanIT.DataTransferModel.UserRole;
using PlanIT.Logging;
using PlanIT.Mappers;
using PlanIT.Models;
using PlanIT.Services.Interface;
using PlanIT.Services.Logic;

namespace PlanIT.Controllers
{
    [Route("api/userAssignment")]
    [ApiController]
    public class UserAssignmentController : ControllerBase
    {
        public IUserAssignmentService userAssignmentService { get; }
        private readonly ILoggger loggger;
        public UserAssignmentController(ILoggger loger, IUserAssignmentService aLogic)
        {
            loggger = loger;
            userAssignmentService = aLogic;
        }

        [HttpGet]
        public async Task<List<GetUserAssignmentDTO>> GetUserAssignments()
        {
            loggger.LogInformation($"Called {nameof(GetUserAssignments)} from UserAssignmentService");
            var userRole = await userAssignmentService.GetAllUserAssignmentsAsync();

            return userRole.Select(UserAssignmentMapper.ToDto).ToList();
        }
    }
}
