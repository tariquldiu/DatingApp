import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'src/app/_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [CommonModule, TimeagoModule, FormsModule],
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit{
  @ViewChild("messageForm") messageForm?: NgForm
  messageService = inject(MessageService) 
  @Input() username!: string;
  messageContent = '';

  ngOnInit(){
    //this.loadMessages();

  }

  sendMessages(){
    this.messageService.sendMessage(this.username, this.messageContent).then(() =>{
      this.messageForm?.reset();
    })
   
  }
}
