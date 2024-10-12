import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports:[RouterOutlet, NavComponent]
})
export class AppComponent {
  title = 'Dating app';
  users: any;

  constructor(private http: HttpClient){}
  
  ngOnInit(): void{
    this.http.get('https://localhost:5001/api/users').subscribe({
      next: res=>{
        this.users = res
      },
      error: error=> console.log(error),
      complete:()=> console.log('Result has been completed.')
    })
  }


}
