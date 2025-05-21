import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.production';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project';
import { AssignmentList } from '../models/AssigmentList';
@Injectable({
  providedIn: 'root'
})
export class ProjectdashboardService {

  constructor(private http:HttpClient) { }

  getProjects():Observable<Project[]>{
    return this.http.get<Project[]>(`${environment.apiUrl}/project`);
  }

  getProject(projectID:number):Observable<Project>{
    return this.http.get<Project>(`${environment.apiUrl}/project/${projectID}`);
  }
  getProjectWithLeaderInformation(projectID:number):Observable<Project>{
    return this.http.get<Project>(`${environment.apiUrl}/project/project-with-leader/${projectID}`);
  }
  getAssignmentById(Id: number): Observable<any>{
    return this.http.get<AssignmentList[]>(`${environment.apiUrl}/user/projects-by-user?UserID=${Id}`)
  }
 
 
  updateProject(project: Project, senderId: number): Observable<Project> {
    return this.http.put<Project>(`${environment.apiUrl}/project/${project.projectID}?senderId=${senderId}`, project);
  }

  dismissProject(projectID: number, senderId: number): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/project/archive-project?projectID=${projectID}&senderId=${senderId}`, {});
  }


  createProject(project: Project, senderId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/project?senderId=${senderId}`, project);
}



  getPlannedProject(userID: number): Observable<string>{
    return this.http.get<string>(`${environment.apiUrl}/userProject/planned-project-count-by-userID?userID=${userID}`)
  }

  getProjectCountByUser(userID:number):Observable<string>{
    return this.http.get<string>(`${environment.apiUrl}/userProject/project-count-by-userID?userID=${userID}`)
  }

  getActiveProject(userID:number):Observable<string>{
    return this.http.get<string>(`${environment.apiUrl}/userProject/active-project-count-by-userID?userID=${userID}`)

  }

  getCompletedProject(userID:number):Observable<string>{
    return this.http.get<string>(`${environment.apiUrl}/userProject/completed-project-count-by-userID?userID=${userID}`)
  }

  getProjectsByUser(userID:number):Observable<any>{
    return this.http.get<string>(`${environment.apiUrl}/user/projects-by-user?UserID=${userID}`)
  }
  
}