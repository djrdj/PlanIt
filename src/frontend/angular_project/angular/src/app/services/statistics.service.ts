import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.production';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  getCommentsCountByDate(projectID: number, subprojectID?: number): Observable<CommentsCountByDate> {
    let url = `${this.baseUrl}/get-comments-count-by-date/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<CommentsCountByDate>(url);
  }

  getUserWithMostComments(projectID: number, subprojectID?: number): Observable<UserWithCountDTO> {
    let url = `${this.baseUrl}/get-most-engaged-user/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<UserWithCountDTO>(url);
  }

  getUsersOnProjectWithTaskCount(projectID: number, subprojectID?: number): Observable<UserWithCountDTO> {
    let url = `${this.baseUrl}/get-users-on-project-with-task-count/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<UserWithCountDTO>(url);
  }

  getUsersOnProjectWithCompletedTaskCount(projectID: number, subprojectID?: number): Observable<UserWithCountDTO> {
    let url = `${this.baseUrl}/get-users-on-project-with-completed-task-count/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<UserWithCountDTO>(url);
  }

  getUniqueUsers(projectID: number, subprojectID?: number): Observable<number> {
    let url = `${this.baseUrl}/unique-users/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<number>(url);
  }

  getHighPriorityTasks(projectID: number, subprojectID?: number): Observable<number> {
    let url = `${this.baseUrl}/high-priority-tasks/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<number>(url);
  }

  getProgressByStatuses(projectID: number, subprojectID?: number): Observable<StatusProgress> {
    let url = `${this.baseUrl}/progress-by-statuses/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<StatusProgress>(url);
  }

  getTaskCountsByStatus(projectID: number, subprojectID?: number): Observable<StatusProgress>{
    let url = `${this.baseUrl}/task-counts-by-status/${projectID}`;
    if (subprojectID !== undefined) {
      url += `/${subprojectID}`;
    }
    return this.http.get<StatusProgress>(url);
  }

  
}

export interface CommentsCountByDate {
  [date: string]: number; // Use string as the key for dates
}

export interface UserWithCountDTO {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  pictureURL: string;
  count: number;
}

export interface AverageTimeToCompleteTask {
  [taskId: number]: {
    [status: string]: string; // Assuming time is represented as a string
  };
}

export interface StatusProgress {
  [status : string] : number;
}