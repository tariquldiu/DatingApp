using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService(IConfiguration configuration, UserManager<AppUser> userManager) : ITokenService
    {

        public async Task<string> CreateToken(AppUser user)
        {
             var tokenKey = configuration["TokenKey"];
                if (string.IsNullOrEmpty(tokenKey))
                {
                    throw new ArgumentException("TokenKey is not found or is empty in the configuration.");
                }

                if (tokenKey.Length < 64)
                {
                    throw new ArgumentException("TokenKey must be at least 64 characters long.");
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

            if(user.UserName == null) throw new Exception("No username for user");
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName)
            };

            var roles = await userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor{
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}