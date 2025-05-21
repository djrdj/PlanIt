using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlanIT.DataTransferModel.KanbanColumn
{
    public class CreateKanbanColumnDTO
    {
        public int? UserID { get; set; }
        public int? ProjectID { get; set; }
        public string? Status { get; set; }
        public int? Index { get; set; }
    }
}
