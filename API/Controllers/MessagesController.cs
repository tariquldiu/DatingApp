using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MessagesController(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper): BaseApiController
    {
        
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var username = User.GetUserName();

            if(username == createMessageDto.RecipientUsername.ToLower()){
                return BadRequest("You can't message yourself.");
            }

            var sender = await userRepository.GetUserByUsernameAsync(username);
            var recipient = await userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername.ToLower());

            if(sender == null || recipient == null) return BadRequest("Can't sent message at this time");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            messageRepository.AddMessage(message);
            if(await messageRepository.SaveAllAsync()) return Ok(mapper.Map<MessageDto>(message));

            return BadRequest("Failed to save message");
        }

        [HttpGet("get-message-for-user")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageForUser([FromQuery]MessageParams messageParams){

            messageParams.UserName = User.GetUserName();

            var messages = await messageRepository.GetMessageForUser(messageParams); 

            Response.AddPaginationHeader(messages);
            return messages;
        }

        [HttpGet("thread{username}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username){

            var currentUsername = User.GetUserName();

            return Ok(await messageRepository.GetMessageThread(currentUsername, username));
        }

       
    }
}