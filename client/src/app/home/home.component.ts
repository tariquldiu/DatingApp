import { NgIf } from '@angular/common';
import { Component} from '@angular/core';
import { RegisterComponent } from "../register/register.component";

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [NgIf, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent{
  registerMode = false;

  registerToggle(){
    this.registerMode =!this.registerMode;
  }
  cancelRegisterMode(event:boolean){
    this.registerMode = event;
  }
 
}
