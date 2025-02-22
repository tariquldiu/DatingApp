import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';
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
  private messageService = inject(MessageService) 
  @Input() username!: string;
  @Input() messages!: Message[];
  @Output() updateMessages = new EventEmitter<Message>(); 
  messageContent = '';

  ngOnInit(){
    //this.loadMessages();

  }

  sendMessages(){
    this.messageService.sendMessage(this.username, this.messageContent).subscribe({
      next: message => 
        {
          this.updateMessages.emit(message);
          this.messageForm?.reset();
        }
    })
   
  }
}
