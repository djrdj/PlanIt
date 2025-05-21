using DemoMarija.API.Data;
using DemoMarija.API.Models.Domain;
using DemoMarija.API.Respositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace DemoMarija.API.Respositories.Implementation {
    public class CategoryRepository : ICategoryRepository {

        private readonly ApplicationDbContext _dbContext;
        public CategoryRepository(ApplicationDbContext dbContext)
        {
            this._dbContext = dbContext;
        }
        public async Task<Category> CreateAsync(Category category) {
            await _dbContext.Categories.AddAsync(category);
            await _dbContext.SaveChangesAsync(); // Sad zapravo sacuvamo promene u bazi

            return category;
        }

        async Task<List<Category>> ICategoryRepository.ListAllAsync() {
            var categories = await _dbContext.Categories.ToListAsync();

            return categories;
        }

        async Task<bool> ICategoryRepository.DeleteAsync(int categoryId) {
            var category = await _dbContext.Categories.FindAsync(categoryId);
            if (category == null) { return false; }
            
            _dbContext.Categories.Remove(category);
            await _dbContext.SaveChangesAsync();
            return true;
        }

    }
}
