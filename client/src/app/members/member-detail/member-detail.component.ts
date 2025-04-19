import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { MemberService } from 'src/app/_services/member.service';
import { Member } from 'src/app/_models/member';
import { ActivatedRoute, Router } from '@angular/router';
import { NgImageSliderModule } from 'ng-image-slider';
import { DatePipe, NgIf } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';
import { AccountService } from 'src/app/_services/account.service';
import { HubConnectionState } from '@microsoft/signalr';


@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [MemberMessagesComponent, TabsModule, NgImageSliderModule, NgIf, TimeagoModule, DatePipe],
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {

  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent
  private accountService = inject(AccountService);
  private messageService = inject(MessageService);
  presenceService = inject(PresenceService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  member:Member ={} as Member;
  imageObject: Array<object> = [];
  activeTab?: TabDirective;

  ngOnInit(){
   
    this.activatedRoute.data.subscribe({
      next: data => {
        this.member = data['member'];
        this.member && this.member.photos.map((p, index) => {
          this.imageObject.push({image:p.url, thumbImage: p.url, alt: this.member.knownAs, title: (index +1) + ': ' + this.member.knownAs})
        })
      }
    })
    
    this.activatedRoute.paramMap.subscribe({
      next: _=> this.onRouteParamsChange()
    })

    this.activatedRoute.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  selectTab(heading: string){
      if(this.memberTabs){
        const messageTab =  this.memberTabs.tabs.find(x =>x.heading === heading)
        if(messageTab) messageTab.active = true; 
      }
  }

  onRouteParamsChange(){
    const user = this.accountService.currentUser();
    if(!user) return;

    if(this.messageService.hubConnection?.state === HubConnectionState.Connected && this.activeTab?.heading === 'Messages')
    {
      this.messageService.hubConnection.stop().then(()=>{
          this.messageService.createHubConnection(user, this.member.userName)
      })
    }

  }
  onTabActivated(data: TabDirective){
    this.activeTab = data;
    this.router.navigate([],{
        relativeTo: this.activatedRoute,
        queryParams: {tab: this.activeTab.heading},
        queryParamsHandling: 'merge'

    })

    if(this.activeTab.heading === 'Messages' && this.member){
      const user = this.accountService.currentUser();
      if(!user) return;
      this.messageService.createHubConnection(user, this.member.userName);
    }
    else{
      this.messageService.stopHubConnection();
    }
  }

  ngOnDestroy(): void{
    this.messageService.stopHubConnection();
  }
  // loadMember()
  // {
  //   const username = this.activatedRoute.snapshot.paramMap.get('username');
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
