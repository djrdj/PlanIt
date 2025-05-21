import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.production';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private profileService: ProfileService) {  }

  getUserByID(userID:number):Observable<any>{
    return this.http.get(`${environment.apiUrl}/user/${userID}`);
  }

  changeUserByID(userID: number, updatedUser: User): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/user/${userID}`, updatedUser);
  }

  uploadImage(userId: number, imageFile: File):Observable<any> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('imageFile', imageFile);

    return this.http.post(`${environment.apiUrl}/user/upload`, formData).pipe(
      tap(() => {
        // Generate a unique identifier for the event
        const uniqueId = new Date().getTime();
        this.profileService.profilePictureChanged.emit(`${imageFile.name}_${uniqueId}`);
      })
    );
  }

  getAllUsers():Observable<any>{
    return this.http.get(`${environment.apiUrl}/user`)
  }

  getUserRoleByID(userID: number):Observable<any>{
    return this.http.get(`${environment.apiUrl}/userRole/${userID}`);
  }

  deactivateUser(userID: number,user:User):Observable<any>{
    return this.http.put<any>(`${environment.apiUrl}/user/archive-user?userID=${userID}`,user);
  }

  activateUser(userID: number):Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/user/update-activated-status?UserID=${userID}`);
  }

  editUserRole(userID: number, userRoleID: number):Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/user/set-role-for-user?UserID=${userID}&UserRoleID=${userRoleID}`);
  }

  getUsersByProjectID(projectID: number):Observable<any>{
    return this.http.get(`${environment.apiUrl}/project/users-by-project?ProjectID=${projectID}`);
  }

  addUserFromCsv(user: any):Observable<any>{
    return this.http.post(`${environment.apiUrl}/user/import-user-from-csv`, user);
  }
  

  updateLangugage(userID : number, language : string) : Observable<any>
  {

    return this.http.put(`${environment.apiUrl}/user/update-language?userID=${userID}&Language=${language}`,{});
  }
}