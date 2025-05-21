using Back.Data;
using Back.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilmController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public FilmController(ApplicationDbContext context)
        {
            _context = context;
        }

        

        [HttpGet]
        public async Task<ActionResult<List<Film>>> GetFilmovi()
        {
            return Ok(await _context.Filmovi.ToListAsync());
        }

        [HttpPost]
        public async Task<ActionResult<List<Film>>> CreateFilmovi(Film film)
        {
            _context.Filmovi.Add(film);
            await _context.SaveChangesAsync();

            return Ok(await _context.Filmovi.ToListAsync());
        }

        [HttpPut]
        public async Task<ActionResult<List<Film>>> UpdateFilmovi(Film film)
        {
            var dBfilm = await _context.Filmovi.FindAsync(film.Id);

            if (dBfilm == null)
                return BadRequest("Film nije pronajden");
            dBfilm.Naziv = film.Naziv;
            dBfilm.Reditelj = film.Reditelj;
            dBfilm.Ocena = film.Ocena;

            await _context.SaveChangesAsync();

           return Ok(await _context.Filmovi.ToListAsync());
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<List<Film>>> DeleteFilmovi(int id)
        {
            var dBfilm = await _context.Filmovi.FindAsync(id);
            if (dBfilm == null)
                return BadRequest("Nije pronadjen film");
            _context.Filmovi.Remove(dBfilm);
            await _context.SaveChangesAsync();

            return Ok(await _context.Filmovi.ToListAsync());

        }


        [HttpGet("{id}")]
        public async Task<ActionResult<List<Film>>> GetFilm(int id)
        {
            var dBfilm = await _context.Filmovi.FindAsync(id);
            if (dBfilm == null)
                return BadRequest("Nije pronadjen film");
           
            return Ok(dBfilm);
          

        }


    }
}
