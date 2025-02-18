import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [CommonModule, TimeagoModule],
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit{
  private messageService = inject(MessageService) 
  @Input() username!: string;
  messages: Message[] = [];

  ngOnInit(){
    this.loadMessages();

  }

  loadMessages(){
    this.messageService.getMessageThread(this.username).subscribe({
      next: message => this.messages = message
    })
   
  }
}
