import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RegisterComponent } from "../register/register.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [NgIf, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  http =inject(HttpClient);
  registerMode = false;
  users: any;
 ngOnInit(): void {
   this.getUsers(); 
 }
  registerToggle(){
    this.registerMode =!this.registerMode;
  }
  cancelRegisterMode(event:boolean){
    this.registerMode = event;
  }
  getUsers(){
    this.http.get('https://localhost:5001/api/users').subscribe({
      next: res=>{
        this.users = res
      },
      error: error=> console.log(error),
      complete:()=> console.log('Result has been completed.')
    })
  }
}
