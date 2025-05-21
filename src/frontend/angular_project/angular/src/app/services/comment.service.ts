import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment } from '../models/comment';
import { environment } from '../../environments/environment.production';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http:HttpClient) { }

  createNewComment(comment:Comment):Observable<Comment>
  {
    return this.http.post<Comment>(`${environment.apiUrl}/comment`,comment);
  }
}
