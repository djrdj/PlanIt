using Microsoft.Extensions.Configuration;
using PlanIT.Models;
using PlanIT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace PlanIT.Services.Logic
{
    public class ClockifyService: IClockifyService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;

        public ClockifyService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Clockify:ApiKey"];
            _baseUrl = configuration["Clockify:BaseUrl"];

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<List<TimeEntry>> GetUserTimeEntriesAsync(string workspaceId, int userId, int projectId)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/workspaces/{workspaceId}/user/{userId}/time-entries");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var timeEntries = JsonSerializer.Deserialize<List<TimeEntry>>(jsonResponse);

            return timeEntries.Where(te => te.ProjectID == projectId).ToList();
        }
    }
}
