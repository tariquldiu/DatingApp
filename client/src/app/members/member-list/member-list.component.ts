import { Component, inject } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MemberService } from 'src/app/_services/member.service';
import { Member } from 'src/app/_models/member';
import { MemberCardComponent } from '../member-card/member-card.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, NgFor],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent {
 private memberService = inject(MemberService);
 members: Member[]= [];

 ngOnInit():void{
  this.loadMembers();
 }

 loadMembers(){
    this.memberService.getMembers().subscribe({
      next: members=> this.members = members
    })
 }
}
