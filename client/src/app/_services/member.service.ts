import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';
import { PaginationResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { setPaginatedResponse, setPaginationHeader } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http=inject(HttpClient);
  private accountService = inject(AccountService)
  baseUrl =environment.apiUrl;
  paginatedResult = signal<PaginationResult<Member[]> | null>(null);
  memberCache = new Map();
  user = this.accountService.currentUser();
  userParam = signal<UserParams>(new UserParams(this.user))
  
  resetYourParams(){
    this.userParam.set(new UserParams(this.user))
  }

  getMembers(){
    const response = this.memberCache.get(Object.values(this.userParam()).join('-'));
    if(response) return setPaginatedResponse(response, this.paginatedResult);
    let params = setPaginationHeader(this.userParam().pageNumber, this.userParam().pageSize);

    params = params.append('minAge', this.userParam().minAge);
    params = params.append('maxAge', this.userParam().maxAge);
    params = params.append('gender', this.userParam().gender);
    params = params.append('orderBy', this.userParam().orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: 'response', params}).subscribe({
      next: res =>{
       setPaginatedResponse(res,this.paginatedResult);
       this.memberCache.set(Object.values(this.userParam()).join('-'), res)
      }
    })
    
  }
  
  getMember(username: string){
    const member: Member = [...this.memberCache.values()]
                    .reduce((arr, elem) => arr.concat(elem.body), [])
                    .find((m: Member) => m.userName === username)

    if(member) return of(member)
      
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

