using demo.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace demo.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UcenikController : Controller
    {
        private readonly DataContext _dataContext;
        public UcenikController( DataContext dataContext)
        {
            _dataContext = dataContext;
        }
        // GET: UcenikController
        [HttpGet(Name = "GetUcenik")]
        public IEnumerable<Ucenik> Index()
        {
            return _dataContext.Ucenici.ToArray();
        }

        // POST: UcenikController/Create
        [HttpPost]
        public IEnumerable<Ucenik> Create(Ucenik ucenik)
        {
            _dataContext.Add(ucenik);
            _dataContext.SaveChanges();
            return _dataContext.Ucenici.ToArray();
        }

        // GET: UcenikController/Delete/5
        [HttpDelete("{id}")]
        public IEnumerable<Ucenik> Delete(int id)
        { 
            _dataContext.Remove(_dataContext.Ucenici.Single(a => a.Id == id));
            _dataContext.SaveChanges();

            return _dataContext.Ucenici.ToArray();
        }
    }
}
