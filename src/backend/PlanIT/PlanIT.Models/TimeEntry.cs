using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.Models
{
    public class TimeEntry
    {
        [Key]
        public int TimeEntryID { get; set; }

        [Required]
        public int UserID { get; set; }
        public int? ProjectID { get; set; }
        public int? AssignmentID { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? DurationInMinutes { get; set; }

        public string? Description { get; set; }
    }
}
