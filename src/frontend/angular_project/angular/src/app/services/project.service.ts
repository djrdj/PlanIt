import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.production'; 
import { Task } from '../models/Task';
import { Project } from '../models/project';
import { Comment } from '../models/comment';
import { AssignmentList } from '../models/AssigmentList';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  
  constructor(private http:HttpClient) { }

  getProjectData(Id: number): Observable <Task [] > {
    return this.http.get<Task[]>(`${environment.apiUrl}/assignment/get-assignment-by-user?userId=${Id}`);  
  }
  getProjectDataForManager(Id: number): Observable <Task [] > {
    return this.http.get<Task[]>(`${environment.apiUrl}/assignment/get-assignments-by-project-manager?managerID=${Id}`);  
  }
  getProjects():Observable<Project[]>{
    return this.http.get<Project[]>(`${environment.apiUrl}/project`);
  }

  changeTask(task: Task, senderId: number): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/assignment/${task.assignmentID}?senderId=${senderId}`, task);
  } 
  changeTaskKanban(task: Task): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/assignment/change-status-for-assignment?assignmentID=${task.assignmentID}&status=${task.status}`,task);
  }
  dismissTask(id: number, senderId: number): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/assignment/archive-assignment?assignmentID=${id}&senderId=${senderId}`, {});
  }
  getTaskCount(Id: number): Observable<any>
  {
    return this.http.get<string>(`${environment.apiUrl}/assignment/get-assignment-count-by-user?userId=${Id}`)
  }
  getUserCount(Id: number): Observable<any>{
    return this.http.get<string>(`${environment.apiUrl}/project/get-user-count?ProjectID=${Id}`)
  }
  getActiveTaskCount(Id: number): Observable<any>{
    return this.http.get<string>(`${environment.apiUrl}/project/get-active-tasks-count?ProjectID=${Id}`)
  }
  getCompletedTaskCount(Id: number): Observable<any>{
    return this.http.get<string>(`${environment.apiUrl}/project/get-inactive-tasks-count?ProjectID=${Id}`)
  }
  getAssignmentById(Id: number): Observable<any>{
    return this.http.get<AssignmentList[]>(`${environment.apiUrl}/project//assignmentList/${Id}`)
  }
  getAssignmentList(): Observable<any>{
    return this.http.get<AssignmentList[]>(`${environment.apiUrl}/assignmentList`)
  }
  getAssignmentListByUserId(Id: number): Observable<any>{
    return this.http.get<AssignmentList[]>(`${environment.apiUrl}/user/projects-by-user?UserID=${Id}`)
  }
  createAssignmentList(assignmentList:AssignmentList): Observable<any>{
    return this.http.post<AssignmentList>(`${environment.apiUrl}/assignmentList`,assignmentList)
  }
  getAssignmentWithComments(Id: number): Observable<any>{
    return this.http.get<Task>(`${environment.apiUrl}/assignment/GetAssignmentWithComments?id=${Id}`)
  }
  changeComment(comment:Comment){
    return this.http.put<any>(`${environment.apiUrl}/comment/${comment.commentID}`,comment);
  }
  getAssignmentsByProjectId(Id: number,UserID: number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/assignmentList/project/${Id}/user/${UserID}`)
  }
  getAssignmentsByProjectIdForManager(Id: number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/project/assignments-by-project?ProjectID=${Id}`);
  }
  getAssignmentsByProjectIdForManagerMarija(Id: number, UserID : number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/assignmentList/project-manager/${Id}/user/${UserID}`)
  }
  getAssignmentsByProjectIdGantt(Id: number,UserID: number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/assignment/get-assignmentsWithListName-by-projectID-and-userID?projectID=${Id}&userID=${UserID}`)
  }
  getAssignmentsByAssignmentListId(Id: number,UserID: number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/assignmentList/assignment/${Id}/user/${UserID}`)
  }
  createTask(task: Task, senderId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/assignment?senderId=${senderId}`, task);
  }
  getAssignmentListByProjectId(Id: number): Observable<any>{
    return this.http.get<AssignmentList>(`${environment.apiUrl}/assignmentList/project/${Id}`);
  }
  getAssigmentByAssigmentId(Id: Number): Observable<any>{
    return this.http.get<Task>(`${environment.apiUrl}/assignment/${Id}`);
  }
  getAssigmentsLiByUserId(Id:number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/assignment/get-assignment-by-user?userId=${Id}`);
  }
  getAssignmentsByAssignmentListIdAllUsers(Id: number): Observable<any>{
    return this.http.get<Task[]>(`${environment.apiUrl}/assignmentList/get-assignments-by-assignmentListID?AssignmentListID=${Id}`);
  }
  deleteAssignment(id: number, senderId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/assignmentList/${id}?senderId=${senderId}`);
  }
  getKanbanColumnsForUserId(id:number): Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/kanbanController/${id}`);
  }
  getKanbanColumnsForUserIdAndProjectId(userId:number, projectId:number): Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/kanbanController/${userId}/${projectId}`);
  }
  updateKanbanColumnPosition(userId:number, projectId:number,status:string, newIndex:number): Observable<any>{
    return this.http.put<any>(`${environment.apiUrl}/kanbanController?projectID=${projectId}&userID=${userId}&status=${status}`,newIndex);
  }
  addNewKanbanColumn(userId:number, projectId:number,status:string, newIndex:number): Observable<any>{
    const url=`${environment.apiUrl}/kanbanController`;
    const body={
      userID:userId,
      projectID:projectId,
      status:status,
      index:newIndex
    };
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<any>(url,body,{headers});
  }
  deleteKanbanColumn(userId:number, projectId:number,status:string): Observable<any>{
    return this.http.delete<any>(`${environment.apiUrl}/kanbanController?userID=${userId}&projectID=${projectId}&status=${status}`);
  }


  //kanbanController?userID=1&projectID=1&status=Testing'

  getProject(projectID:number):Observable<Project>{
    return this.http.get<Project>(`${environment.apiUrl}/project/${projectID}`);
  }
}
