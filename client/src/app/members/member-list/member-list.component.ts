import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MemberService } from 'src/app/_services/member.service';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { MemberCardComponent } from '../member-card/member-card.component';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent,NgFor, NgIf, PaginationModule, FormsModule, ButtonsModule],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit{
 memberService = inject(MemberService)
 accountService = inject(AccountService)
 userParams = new UserParams(this.accountService.currentUser())
 genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}]

 ngOnInit():void{
  if(this.memberService.paginatedResult.length===0) this.loadMembers();
 }

 loadMembers(){
  this.memberService.getMembers(this.userParams);
 }
resetFilters(){
  this.userParams = new UserParams(this.accountService.currentUser());
  this.loadMembers();
}
pageChanged(event: any){
  if(this.userParams.pageNumber != event.page)
  {
    this.userParams.pageNumber = event.page;
    this.loadMembers();
  }
}

}
