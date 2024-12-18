import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';
import { Member } from '../_models/member';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http=inject(HttpClient);
  baseUrl =environment.apiUrl;
  members = signal<Member[]>([]);
  
  getMembers(){
    return this.http.get<Member[]>(this.baseUrl + 'users').subscribe({
      next: members=> this.members.set(members)
    })
  }

  getMember(username: string){
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member);
  }
 
}

