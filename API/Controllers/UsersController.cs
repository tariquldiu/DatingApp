using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class UsersController: BaseApiController
{
    private readonly IUserRepository _userRepository;
    private readonly IPhotoService _photoService;
    private readonly IMapper _mapper;
    public UsersController(IUserRepository userRepository,IPhotoService photoService, IMapper mapper)
    {
        _userRepository=userRepository;
        _photoService=photoService;
        _mapper = mapper;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers(){

      var users = await _userRepository.GetMembersAsync();
      return Ok(users);
    }

 
    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username){
        return await _userRepository.GetMemberAsync(username);
       
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto){
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if(username == null) return BadRequest("No username found in token");

        var user = await _userRepository.GetUserByUsernameAsync(username.ToString());

        if(user == null) return BadRequest("Could not find user");

        _mapper.Map(memberUpdateDto, user);

        if(await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to update the user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file){

        var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
        if(user == null) return BadRequest("Cannot update user");

        var result = await _photoService.AddPhotoAsync(file);
        if(result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo{
            Url = result.SecureUrl.AbsoluteUri,
            publicId = result.PublicId
        };

        user.Photos.Add(photo);
        if(await _userRepository.SaveAllAsync()) {
            return CreatedAtAction(nameof(GetUser), new{username = user.UserName}, _mapper.Map<PhotoDto>(photo));
        }
        return BadRequest("Problem adding photo");
    }
}
