import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';
import { PaginationResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http=inject(HttpClient);
  baseUrl =environment.apiUrl;
 // members = signal<Member[]>([]);
  paginatedResult = signal<PaginationResult<Member[]> | null>(null);
  
  getMembers(userParam : UserParams){
    let params = this.setPaginationHeader(userParam.pageNumber, userParam.pageSize);

    params = params.append('minAge', userParam.minAge);
    params = params.append('maxAge', userParam.maxAge);
    params = params.append('gender', userParam.gender);
    params = params.append('orderBy', userParam.orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: 'response', params}).subscribe({
      next: response =>{
        debugger
        this.paginatedResult.set({
          items: response.body as Member[],
          pagination: JSON.parse(response.headers.get('Pagination')!)
        })
      }
      
    })
    
  }
  private setPaginationHeader(pageNumber: number, pageSize : number){
    let params = new HttpParams();

      if(pageNumber && pageSize){
        params = params.append('pageNumber', pageNumber);
        params = params.append('pageSize', pageSize);
      }

      return params;
  }
  getMember(username: string){
    // const member = this.members().find(x=>x.userName === username);
    // if(member !== undefined) return of(member);
    
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
      // tap(()=>{
      //   this.members.update(members=> members.map(m=>m.userName === member.userName? member: m))
      // })
    )
  }


  setMainPhoto(photo: Photo){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id,{}).pipe(
      tap(() => {
        // this.members.update(members => members.map(m => {
        //   if(m.photos.includes(photo)){
        //     m.photoUrl = photo.url
        //   }
        //   return m
        // }))
      })
    )
  }

  deletePhoto(photo: Photo){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photo.id).pipe(
      tap(() => {
        // this.members.update(members => members.map(m => {
        //   if(m.photos.includes(photo)){
        //     m.photos = m.photos.filter(x=>x.id !== photo.id)
        //   }
        //   return m;
        // }))
      })
    )
  }
 
}

