
using API.Controllers;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;

public class AdminController(UserManager<AppUser> userManager): BaseApiController
{
    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("user-with-roles")]
    public async Task<ActionResult> GetUserWiseRole()
    {
        var user = await userManager.Users
                    .OrderBy(x=>x.UserName)
                    .Select(x => new 
                    { 
                        x.Id,
                        x.UserName,
                        Roles = x.UserRoles.Select(r=>r.Role.Name).ToList()
                    }).ToListAsync();

        return Ok(user);
    }

    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("edit-role/{username}")]
    public async Task<ActionResult> EditRole(string username, string roles){

        if(string.IsNullOrEmpty(roles)) return BadRequest("you must select at least one role.");

        var selectedRoles = roles.Split(',').ToArray();

        var user = await userManager.FindByNameAsync(username);

        if(user == null) return BadRequest("User not found");

        var userRoles =await userManager.GetRolesAsync(user);

        var result = await userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

        if(!result.Succeeded) return BadRequest("Faild to add roles");

        result = await userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

        if(!result.Succeeded) return BadRequest("Faild to remove roles");

        return Ok(await userManager.GetRolesAsync(user));
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("photo-to-moderate")]
    public ActionResult GetPhotoForModeration()
    {
        return Ok("Admin or moderator can see this.");
    }
}