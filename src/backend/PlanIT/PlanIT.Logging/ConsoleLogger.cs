using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Logging
{
    public class ConsoleLogger : ILoggger
    {
        public void LogInformation(string message)
        {
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine($"Information: {message}");
            Console.ResetColor();
        }

        public void LogWarning(string message)
        {
            Console.BackgroundColor = ConsoleColor.Magenta;
            Console.WriteLine($"Warning: {message}");
            Console.ResetColor();
        }

        public void LogError(string message)
        {
            Console.BackgroundColor = ConsoleColor.Red;
            Console.WriteLine($"Error: {message}");
            Console.ResetColor();
        }
    }
}
