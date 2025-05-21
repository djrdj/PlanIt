using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class TimeRegion
    {
        [Key]
        public int TimeRegionId { get; set; }
        public string TimeRegionName { get; set; }
    }
}
