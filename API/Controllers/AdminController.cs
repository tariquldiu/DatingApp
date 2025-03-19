
using API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API;

public class AdminController: BaseApiController
{
    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("user-with-roles")]
    public ActionResult GetUserWiseRole()
    {
        return Ok("Only admin can see this.");
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("photo-to-moderate")]
    public ActionResult GetPhotoForModeration()
    {
        return Ok("Admin or moderator can see this.");
    }
}