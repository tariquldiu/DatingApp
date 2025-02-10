import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { NgIf, TitleCasePipe } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  standalone:true,
  imports:[FormsModule, NgIf,BsDropdownModule, RouterLink,RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  accountService =inject(AccountService)
  private router =inject(Router)
  private toast =inject(ToastrService)
  model:any ={};

  login(){
    this.accountService.login(this.model).subscribe({
      next: _ =>{
        this.router.navigateByUrl('/members');
      },
      error: err=>this.toast.error(err.error)
    })
  }
  logOut(){
   this.accountService.logout();
   this.router.navigateByUrl('/')
  }
}
