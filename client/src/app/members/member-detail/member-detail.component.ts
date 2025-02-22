import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { MemberService } from 'src/app/_services/member.service';
import { Member } from 'src/app/_models/member';
import { ActivatedRoute } from '@angular/router';
import { NgImageSliderModule } from 'ng-image-slider';
import { DatePipe, NgIf } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';


@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [MemberMessagesComponent, TabsModule, NgImageSliderModule, NgIf, TimeagoModule, DatePipe],
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent
  private memberService = inject(MemberService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  member:Member ={} as Member;
  imageObject: Array<object> = [];
  activeTab?: TabDirective;
  messages: Message[] =[];

  ngOnInit(){
   
    this.route.data.subscribe({
      next: data => {
        this.member = data['member'];
        this.member && this.member.photos.map((p, index) => {
          this.imageObject.push({image:p.url, thumbImage: p.url, alt: this.member.knownAs, title: (index +1) + ': ' + this.member.knownAs})
        })
      }
    })

    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  onUpdateMessages(event: Message){
    this.messages.push(event);
  }

  selectTab(heading: string){
      if(this.memberTabs){
        const messageTab =  this.memberTabs.tabs.find(x =>x.heading === heading)
        if(messageTab) messageTab.active = true; 
      }
  }

  onTabActivated(data: TabDirective){
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages' && this.messages.length === 0 && this.member){
       this.messageService.getMessageThread(this.member.userName).subscribe({
        next: messages => this.messages = messages
       })
    }
  }

  // loadMember()
  // {
  //   const username = this.route.snapshot.paramMap.get('username');
  //   if(!username)return;

  //   this.memberService.getMember(username).subscribe({
  //     next: member =>{
  //       this.member = member;
  //       member.photos.map((p, index) => {
  //         this.imageObject.push({image:p.url, thumbImage: p.url, alt: member.knownAs, title: (index +1) + ': ' + member.knownAs})
  //       }
  //       )
  //     } 
  //   })
      
  //  }
}
