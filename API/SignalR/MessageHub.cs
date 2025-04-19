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
  
    public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
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
            await AddToGroup(groupName);

            var message = await messageRepository.GetMessageThread(Context.User!.GetUserName(), othersUser!);
            await Clients.Group(groupName).SendAsync("ReceiveMessageThread", message);  
        }

        public async Task SendMessage(CreateMessageDto createMessageDto){
             var username = Context.User!.GetUserName()?? throw new Exception("Could not get user");

            if(username == createMessageDto.RecipientUsername.ToLower()){
                throw new HubException("You cannot message yourself");
            }

            var sender = await userRepository.GetUserByUsernameAsync(username);
            var recipient = await userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername.ToLower());

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
            var group = await messageRepository.GetMessageGroup(groupName);

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

            messageRepository.AddMessage(message);
            if(await messageRepository.SaveAllAsync()) 
            {
                await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
               
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await RemoveFromMessageGroup();
            await base.OnDisconnectedAsync(exception);
        }

        private string GetGroupName(string caller, string other){
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}": $"{other}-{caller}";
        }

        private async Task<bool> AddToGroup(string groupName){
            var username = Context.User?.GetUserName()?? throw new Exception("Can not get username");
            var group = await messageRepository.GetMessageGroup(groupName);
            var connection = new Connection{ConnectionId = Context.ConnectionId, Username = username};
            
            if(group is null){
                group = new Group { Name = groupName};
                messageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            return await messageRepository.SaveAllAsync();
        }

        private  async Task RemoveFromMessageGroup(){
            var connection = await messageRepository.GetConnection(Context.ConnectionId);

            if(connection is not null){
                messageRepository.RemoveConnection(connection);
                await messageRepository.SaveAllAsync();
            }

        }
    }
}