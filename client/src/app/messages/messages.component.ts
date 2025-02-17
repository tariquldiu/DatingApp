import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CommonModule, NgFor } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [ButtonsModule, FormsModule, CommonModule, TimeagoModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messageService = inject(MessageService);
  container = 'Outbox';
  pageNumber = 1;
  pageSize = 5;

  ngOnInit(): void{
    this.loadMessage();
  }

  loadMessage(){
      this.messageService.getMessage(this.pageNumber, this.pageSize, this.container);

  }
  pageChanged( event: any){
    if(this.pageNumber !== event.page){
      this.pageNumber =event.page;
      this.loadMessage();
    }
  }
}
