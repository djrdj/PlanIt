using Demo_apk_API.Data;
using Demo_apk_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Demo_apk_API.Controllers
{
    //ako ne radi [controler] stavi employees
    [ApiController]
    [Route("api/[controller]")] 
    public class EmployeesController : Controller
    {
        private readonly DB_context _db_Context;

        public EmployeesController(DB_context db_context)
        {
            _db_Context = db_context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _db_Context.Employees.ToListAsync();

            return Ok(employees);
        }


        [HttpPost]
        public async Task<IActionResult> AddEmployee([FromBody] Employee employeeRequest)
        {
            employeeRequest.Id = Guid.NewGuid();
            await _db_Context.Employees.AddAsync(employeeRequest);
            await _db_Context.SaveChangesAsync();

            return Ok(employeeRequest);
        }


        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetEmployee([FromRoute] Guid id)
        {
            var employee = await _db_Context.Employees.FirstOrDefaultAsync(x => x.Id == id);
            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateEmployee([FromRoute] Guid id,Employee updateEmployeeRequest)
        {
            var employee = await _db_Context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            employee.Name = updateEmployeeRequest.Name;
            employee.Email = updateEmployeeRequest.Email;
            employee.Salary = updateEmployeeRequest.Salary;
            employee.Phone = updateEmployeeRequest.Phone;
            employee.Department = updateEmployeeRequest.Department;

            await _db_Context.SaveChangesAsync();

            return Ok(employee);
        }


        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteEmployee([FromRoute] Guid id)
        {
            var employee = await _db_Context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            _db_Context.Employees.Remove(employee);
            await _db_Context.SaveChangesAsync();

            return Ok(employee);
        }
    }
}
