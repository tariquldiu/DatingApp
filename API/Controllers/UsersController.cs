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

        if(user.Photos.Count == 0) photo.IsMain = true;
        user.Photos.Add(photo);
        if(await _userRepository.SaveAllAsync()) {
            return CreatedAtAction(nameof(GetUser), new{username = user.UserName}, _mapper.Map<PhotoDto>(photo));
        }
        return BadRequest("Problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId:int}")]
    public async Task<ActionResult> SetMainPhoto(int photoId){

        var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
        if(user == null) return BadRequest("Could not find user.");

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

        if(photo == null || photo.IsMain) return BadRequest("Cannot use this as main photo");

        var currentMain = user.Photos.FirstOrDefault(x=>x.IsMain);

        if(currentMain !=null ) currentMain.IsMain = false;
        photo.IsMain = true;

        if(await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Problem setting main photo.");
        
    }

    [HttpDelete("delete-photo/{photoId:int}")]
    public async Task<ActionResult> DeletePhoto(int photoId){
        var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
            if(user == null){
                return BadRequest("User not found.");
            }
        var photo = user.Photos.FirstOrDefault(x=>x.Id == photoId);

        if(photo == null || photo.IsMain) return BadRequest("This photo cannot be deleted.");

        if(photo.publicId != null){
            var result = await _photoService.DeletePhotoAsync(photo.publicId);
            if(result.Error != null) return BadRequest(result.Error.Message);
        }

        user.Photos.Remove(photo);

        if(await _userRepository.SaveAllAsync()) return Ok();

        return BadRequest("Problem deleting photo.");
    }

}
