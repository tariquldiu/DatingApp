using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Helpers
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader<T>(this HttpResponse response, PaggedList<T> data){
            var paginationHeader = new PaginationHeader(data.CurrentPage, data.PageSize, data.TotalCount, data.TotalPage);

            var jsonOptions = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase};
                response.Headers.Append("Pagination", JsonSerializer.Serialize(paginationHeader, jsonOptions));
                response.Headers.Append("Access-Control-Expose-Headers", "Pagination");
        }
    }
}