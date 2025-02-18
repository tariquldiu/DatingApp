import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaginationResult } from '../_models/pagination';
import { Message } from '../_models/message';
import { setPaginatedResponse, setPaginationHeader } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  paginatedResult = signal<PaginationResult<Message[]> | null>(null);

  getMessage(pageNumber: number, pageSize: number, container: string){
    let params = setPaginationHeader(pageNumber, pageSize);

    params = params.append('Container', container);

    return this.http.get<Message[]>(this.baseUrl + 'messages/get-message-for-user',{observe: 'response', params})
    .subscribe({
      next: response => setPaginatedResponse(response, this.paginatedResult)
    })

  }

  getMessageThread(username: string){
    return this.http.get<Message[]> (this.baseUrl + 'messages/thread'+ username)
  }
}
