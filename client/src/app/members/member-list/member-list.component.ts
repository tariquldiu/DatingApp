import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MemberService } from 'src/app/_services/member.service';
import { Member } from 'src/app/_models/member';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent,NgFor],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit{
 memberService = inject(MemberService)

 ngOnInit():void{
  if(this.memberService.members().length === 0) this.loadMembers();
 }

 loadMembers(){
  this.memberService.getMembers();
 }

}
