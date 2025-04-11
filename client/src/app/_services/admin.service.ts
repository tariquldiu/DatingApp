import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http =inject(HttpClient);

  getUserWiseRoles(){
     return this.http.get<User[]>(this.baseUrl + 'admin/user-with-roles');
  }

  updateUserRoles( username : string, roles: string[]){
    debugger
    return this.http.post<string>(this.baseUrl + 'admin/edit-roles/' + username + '?roles=' + roles,{});

  }
}
