import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { CommonModule, NgIf } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports:[RouterOutlet,CommonModule,NgIf, NavComponent, HomeComponent ]
})
export class AppComponent {
  http = inject(HttpClient);
  accountService = inject(AccountService);
  title = 'Dating app';
  users: any;


  ngOnInit(): void{
    this.setCurrentUser();
  }

  setCurrentUser(){
    const userString = localStorage.getItem('user');
    if(!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
      
  }
}
