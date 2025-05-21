using DemoMarija.API.Models.Domain;

namespace DemoMarija.API.Respositories.Interface {
    public interface ICategoryRepository {
        Task<Category> CreateAsync(Category category);
        Task<List<Category>> ListAllAsync();
        Task<bool> DeleteAsync(int categoryId);
    }
}
