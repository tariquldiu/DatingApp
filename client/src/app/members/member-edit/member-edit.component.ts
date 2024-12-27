import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AccountService } from 'src/app/_services/account.service';
import { MemberService } from 'src/app/_services/member.service';
import { Member } from 'src/app/_models/member';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [CommonModule, TabsModule, NgIf, FormsModule, PhotoEditorComponent],
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MemberEditComponent implements OnInit{
  @ViewChild('editForm') editForm? :NgForm
  @HostListener('window: beforeunload', ['$event']) notify($event: any){
    if(this.editForm?.dirty){
      $event.returnValue =true; 
    }
  }
  
  private accountService = inject(AccountService);
  private memberService = inject(MemberService);
  private toast =inject(ToastrService)
  member? : Member;

  ngOnInit(): void {
    this.loadMember();
  }


  loadMember() {
    const user = this.accountService.currentUser();
    if (!user) return;
  
    this.memberService.getMember(user.username).subscribe({
      next: (member) => {
        this.member = member; 
      },
      error: (err) => {
        console.error('Error loading member:', err);
      },
    });
  }

  updateMember(){
    this.memberService.updateMember(this.editForm?.value).subscribe({
      next: _ =>{
        this.toast.success('Profile updated successfully');
        this.editForm?.reset(this.member);
      }
    })
    
  }

  onMemberChange(event: Member){
    this.member = event
  }
}
