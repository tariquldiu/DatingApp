import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CommonModule, NgFor } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';
import { RouterLink } from '@angular/router';
import { Message } from '../_models/message';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [ButtonsModule, FormsModule, CommonModule, TimeagoModule,RouterLink, PaginationModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messageService = inject(MessageService);
  container = 'Outbox';
  pageNumber = 1;
  pageSize = 5;
  isOutbox = this.container === "Outbox";


  ngOnInit(): void{
    this.loadMessage();
  }

  loadMessage(){
      this.messageService.getMessage(this.pageNumber, this.pageSize, this.container);

  }
  getRoute(message: Message){
    if(this.container === 'Outbox') return `/members/${message.recipientUsername}`;
    else return `/members/${message.senderUsername}`;
  }
  pageChanged( event: any){
    if(this.pageNumber !== event.page){
      this.pageNumber =event.page;
      this.loadMessage();
    }
  }
}
