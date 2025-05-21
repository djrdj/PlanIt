import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.production';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClockitService {

  constructor(private http:HttpClient) { }

  createNewEntry(entry: Entry):Observable<Entry>
  {
    return this.http.post<Entry>(`${environment.apiUrl}/TimeTracking/start?userId=${entry.userId}&projectId=${entry.projectId}&assignmentId=${entry.assignmentId}&Desc=${entry.Desc}`, {});
  }

  getUserTimeEntries(userId : number):Observable<any[]>
  {
    return this.http.get<any[]>(`${environment.apiUrl}/TimeTracking/user/${userId}`);
  }

  endEntry(timeEntryId : number) : Observable<any>
  {
    return this.http.post<Entry>(`${environment.apiUrl}/TimeTracking/end/${timeEntryId}`, {});
  }
  getTotalForProjectByDate(projectId : number):Observable<any[]>{
    return this.http.get<any[]>(`${environment.apiUrl}/TimeTracking/project/${projectId}`);
  }
}

export interface Entry{
  userId : number;
  projectId : number;
  assignmentId : number;
  Desc : string;
}