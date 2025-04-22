using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
  
    public class MessageHub(IUnitOfWork unitOfWork, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var httpcontext = Context.GetHttpContext();
            var othersUser = httpcontext?.Request.Query["user"];

            if(Context.User == null || string.IsNullOrEmpty( othersUser)){
                throw new Exception("Can't join the group");
            }

            var groupName = GetGroupName(Context.User!.GetUserName(), othersUser!);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);  

            var message = await unitOfWork.MessageRepository.GetMessageThread(Context.User!.GetUserName(), othersUser!);

            if(unitOfWork.HasChanges()) await unitOfWork.Complete();
            await Clients.Caller.SendAsync("ReceiveMessageThread", message);  
        }

        public async Task SendMessage(CreateMessageDto createMessageDto){
             var username = Context.User!.GetUserName()?? throw new Exception("Could not get user");

            if(username == createMessageDto.RecipientUsername.ToLower()){
                throw new HubException("You cannot message yourself");
            }

            var sender = await unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            var recipient = await unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername.ToLower());

            if(sender == null || recipient == null || sender.UserName == null || recipient.UserName == null)  throw new HubException("Can't sent message at this time");

            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            var groupName = GetGroupName(sender.UserName, recipient.UserName);
            var group = await unitOfWork.MessageRepository.GetMessageGroup(groupName);

            if(group is not null && group.Connections.Any(x=>x.Username == recipient.UserName)){
                message.DateRead = DateTime.UtcNow;
            }
            else{
                var connections = await PresenceTracker.GetConnectionsForUser(recipient.UserName);
                if(connections is not null && connections?.Count is not null){
                    await presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", 
                    new{username = sender.UserName, KnownAs = sender.KnownAs});
                }
            }

            unitOfWork.MessageRepository.AddMessage(message);
            if(await unitOfWork.Complete()) 
            {
                await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
               
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);
            await base.OnDisconnectedAsync(exception);
        }

        private string GetGroupName(string caller, string other){
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}": $"{other}-{caller}";
        }

        private async Task<Group> AddToGroup(string groupName){
            var username = Context.User?.GetUserName()?? throw new Exception("Can not get username");
            var group = await unitOfWork.MessageRepository.GetMessageGroup(groupName);
            var connection = new Connection{ConnectionId = Context.ConnectionId, Username = username};
            
            if(group is null){
                group = new Group { Name = groupName};
                unitOfWork.MessageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

           if(await unitOfWork.Complete()) return group;
           throw new HubException("Failed to join group");
        }

        private  async Task<Group> RemoveFromMessageGroup(){
            var group = await unitOfWork.MessageRepository.GetGroupForConnection(Context.ConnectionId);
            var connection = group?.Connections.FirstOrDefault(c => c.ConnectionId == Context.ConnectionId);

            if(connection is not null && group is not null){

                unitOfWork.MessageRepository.RemoveConnection(connection);
                if(await unitOfWork.Complete()) return group;
            }
          throw new Exception("Failed to remove from group.");
        }
    }
}