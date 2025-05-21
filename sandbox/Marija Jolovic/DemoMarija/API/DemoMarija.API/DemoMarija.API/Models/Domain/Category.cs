using System.ComponentModel.DataAnnotations;

namespace DemoMarija.API.Models.Domain {
    public class Category {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string UrlHandle { get; set; }
    }
}
