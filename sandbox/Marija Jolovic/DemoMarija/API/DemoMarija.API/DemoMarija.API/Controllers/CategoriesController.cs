using DemoMarija.API.Data;
using DemoMarija.API.Models.Domain;
using DemoMarija.API.Models.DTO;
using DemoMarija.API.Respositories.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DemoMarija.API.Controllers {
    
    // https://localhost:xxxx/api/categories
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase {

        private readonly ICategoryRepository _categoryRepository;
        public CategoriesController(ICategoryRepository categoryRepository)
        {
            this._categoryRepository = categoryRepository;
        }

        // Post action method
        [HttpPost]
        public async Task<IActionResult> CreateCategory(CreateCategoryRequestDTO request) {

            // Mapiranje DTO u Domain Model
            // Ne saljemo id, jer zelimo da aplikacija sama to napravi a ne da korisnik zadaje
            var category = new Category
            {
                Name = request.Name,
                UrlHandle = request.UrlHandle
            };
            
            await _categoryRepository.CreateAsync(category); // abstrakcija

            // Mapiramo nazad Domain model u DTO

            var response = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                UrlHandle = category.UrlHandle
            };

            return Ok(response); // obicno http status 200, vracamo DTO objekat 
        }

        [HttpGet]
        public async Task<IActionResult> ListAllCategories() {
             var categories = await _categoryRepository.ListAllAsync();

            return Ok(categories);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id) {
            var deleted = await _categoryRepository.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

     
    }
}
