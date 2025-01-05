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
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController: BaseApiController
    {
         private readonly IUserRepository _userRepository;
        private readonly DataContext _dataContext;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        public AccountController(DataContext dataContext, ITokenService tokenService, IMapper mapper, IUserRepository userRepository)
        {
            _userRepository = userRepository;
            _dataContext = dataContext;
            _tokenService = tokenService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody]RegisterDto register)
        {
            if(await UserExist(register.Username)) return BadRequest("Username is taken");

             var hash = new HMACSHA512();
             var user = _mapper.Map<AppUser>(register);
             user.UserName = register.Username.ToLower();
             user.PasswordHash =hash.ComputeHash(Encoding.UTF8.GetBytes(register.Password));
             user.PasswordSalt = hash.Key;

            _dataContext.Users.Add(user);
            await _dataContext.SaveChangesAsync();
             return new UserDto{
                Username = user.UserName,
                Token =_tokenService.CreateToken(user),
                KnownAs = user.KnownAs
            };
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto){
            var user = await _dataContext.Users
                        .Include(p=>p.Photos)
                        .FirstOrDefaultAsync(x=>x.UserName == loginDto.Username.ToLower());
            if(user == null){
                return Unauthorized("Username invalid.");
            }
             using var hmac = new HMACSHA512(user.PasswordSalt);
             var ComputeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for(int i = 0; i<ComputeHash.Length; i++){
                if(ComputeHash[i] != user.PasswordHash[i]){
                    return Unauthorized("Invalid Password");
                }
            }
            return new UserDto{
                Username = user.UserName,
                KnownAs = user.KnownAs,
                Token =_tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault()?.Url
            };
        }

        private async Task<bool> UserExist(string username)
        {
            return await _dataContext.Users.AnyAsync(u => u.UserName == username.ToLower());
        }

      
    }
}