using System.ComponentModel.DataAnnotations;

namespace Back.Models
{
    public class Film
    {
        
        
        public int Id { get; set; }

        public string Naziv { get; set; } = string.Empty;

        public string Reditelj { get; set; } = string.Empty;

        public double Ocena { get; set; }
    }
}
