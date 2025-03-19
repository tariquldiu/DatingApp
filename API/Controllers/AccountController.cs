using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper): BaseApiController
    {
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody]RegisterDto register)
        {
            if(await UserExist(register.Username)) return BadRequest("Username is taken");

             var hash = new HMACSHA512();
             var user = mapper.Map<AppUser>(register);
             user.UserName = register.Username.ToLower();
             var result = await userManager.CreateAsync(user, register.Password);

             if(!result.Succeeded) return BadRequest(result.Errors);
          
             return new UserDto{
                Username = user.UserName,
                Token = await tokenService.CreateToken(user),
                KnownAs = user.KnownAs,
                Gender = user.Gender
            };
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto){
            var user = await userManager.Users
                        .Include(p=>p.Photos)
                        .FirstOrDefaultAsync(x=>x.NormalizedUserName == loginDto.Username.ToUpper());
            if(user == null || user.UserName == null){
                return Unauthorized("Username invalid.");
            }
            var result = await userManager.CheckPasswordAsync(user, loginDto.Password);
            if(!result) return Unauthorized();

            return new UserDto{
                Username = user.UserName,
                KnownAs = user.KnownAs,
                Gender = user.Gender,
                Token =await tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault()?.Url
            };
        }

        private async Task<bool> UserExist(string username)
        {
            return await userManager.Users.AnyAsync(u => u.NormalizedUserName == username.ToUpper());
        }

      
    }
}