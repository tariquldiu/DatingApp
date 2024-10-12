using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController: BaseApiController
    {
        private readonly DataContext _dataContext;
        private readonly ITokenService _tokenService;
        public AccountController(DataContext dataContext, ITokenService tokenService)
        {
            _dataContext = dataContext;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody]RegisterDto register)
        {
             var hash = new HMACSHA512();
            if(await UserExist(register.Username)) return BadRequest("Username is taken");
             var user = new AppUser{
                UserName = register.Username.ToLower(),
                PasswordSalt = hash.Key,
                PasswordHash = hash.ComputeHash(Encoding.UTF8.GetBytes(register.Password))
               
             };
            
            _dataContext.Users.Add(user);
            await _dataContext.SaveChangesAsync();
             return new UserDto{
                Username = register.Username.ToLower(),
                Token =_tokenService.CreateToken(user)
            };
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto){
            var user = await _dataContext.Users.SingleOrDefaultAsync(x=>x.UserName == loginDto.Username.ToLower());
            if(user == null){
                return BadRequest("Username invalid.");
            }
             using var hmac = new HMACSHA512(user.PasswordSalt);
             var ComputeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for(int i = 0; i<ComputeHash.Length; i++){
                if(ComputeHash[i] != user.PasswordHash[i]){
                    return BadRequest("Invalid Password");
                }
            }
            return new UserDto{
                Username = loginDto.Username.ToLower(),
                Token =_tokenService.CreateToken(user)
            };
        }

        private async Task<bool> UserExist(string username)
        {
            return await _dataContext.Users.AnyAsync(u => u.UserName == username.ToLower());
        }
    }
}