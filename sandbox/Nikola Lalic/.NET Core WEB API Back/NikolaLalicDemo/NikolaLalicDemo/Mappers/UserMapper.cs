using NikolaLalicDemo.DataTransferModel;
using NikolaLalicDemo.Models;

namespace NikolaLalicDemo.API.Mappers
{
    public static class UserMapper
    {
        public static GetUserDTO ToDto(this User user) => new()
        {
            Username = user.Username,
            Password = user.Password
        };
    }
}
