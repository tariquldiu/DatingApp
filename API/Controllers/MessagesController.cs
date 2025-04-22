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
    public class MessagesController(IUnitOfWork unitOfWork, IMapper mapper): BaseApiController
    {
        
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var username = User.GetUserName();

            if(username == createMessageDto.RecipientUsername.ToLower()){
                return BadRequest("You can't message yourself.");
            }

            var sender = await unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            var recipient = await unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername.ToLower());

            if(sender == null || recipient == null || sender.UserName == null || recipient.UserName == null) return BadRequest("Can't sent message at this time");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            unitOfWork.MessageRepository.AddMessage(message);
            if(await unitOfWork.Complete()) return Ok(mapper.Map<MessageDto>(message));

            return BadRequest("Failed to save message");
        }

        [HttpGet("get-message-for-user")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageForUser([FromQuery]MessageParams messageParams){

            messageParams.UserName = User.GetUserName();

            var messages = await unitOfWork.MessageRepository.GetMessageForUser(messageParams); 

            Response.AddPaginationHeader(messages);
            return messages;
        }

        [HttpGet("thread{username}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username){

            var currentUsername = User.GetUserName();

            return Ok(await unitOfWork.MessageRepository.GetMessageThread(currentUsername, username));
        }

       [HttpDelete("{id}")]
       public async Task<ActionResult> DeleteMessage(int id){

        var username = User.GetUserName();
        var message = await unitOfWork.MessageRepository.GetMessage(id);

        if(message == null) return BadRequest("Can't delete this message.");

        if(message.SenderUsername != username && message.RecipientUsername != username) {
            return Forbid();
        }

        if(message.SenderUsername == username) message.SenderDeleted = true;
        if(message.RecipientUsername == username) message.RecipientDeleted = true;

        if(message is {SenderDeleted: true, RecipientDeleted: true}){
            unitOfWork.MessageRepository.DeleteMessage(message);
        }

        if(await unitOfWork.Complete()) return Ok();

        return BadRequest("Problem deleting message.");
       }
    }
}