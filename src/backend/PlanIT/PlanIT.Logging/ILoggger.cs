﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Logging
{
    public interface ILoggger
    {
        void LogInformation(string message);
        void LogWarning(string message);
        void LogError(string message);
    }
}
