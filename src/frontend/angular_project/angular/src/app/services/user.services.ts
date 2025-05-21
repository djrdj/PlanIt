import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../components/signin/signin.component';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment.production'; 

@Injectable({
  providedIn: 'root',
})

export class ApiService {
  private baseUrl: string = environment.apiUrl + '/user';

  constructor(private readonly httpClient: HttpClient, private cookie: CookieService) { }

  login(user: LoginModel): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/login`, user);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const resetPasswordUrl = `${this.baseUrl}/reset-password`;
    const headers = { 'Content-Type': 'application/json' };
    return this.httpClient.put(resetPasswordUrl, { token, newPassword }, {headers});
  }
  sendResetPasswordMail(email: string): Observable<any>
  {
    const url = `${this.baseUrl}/forgot-password`;

    const body = { email };
    const headers = { 'Content-Type': 'application/json' };
  
    return this.httpClient.post(url, body, { headers });
  }

  sendRegMail(email: string, username: string, userRoleID : number): Observable<any>
  {
    const url = `${this.baseUrl}/send-register-email`;

    const body = { email, username, userRoleID };
    const headers = { 'Content-Type': 'application/json' };
  
    return this.httpClient.post(url, body, { headers });
  }
  registerNewUser(token: string, password: string, firstName: string, lastName: string, phoneNumber: string, day: number, month:string, year:number, timeRegionID: number, userRoleID : number): Observable<any> {
    const url = `${this.baseUrl}/register-user`;
  
    const body = {
      Token: token,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      PhoneNumber: phoneNumber,
      Day: day,
      Month: month,
      Year: year,
      TimeRegionID: timeRegionID,
      UserRoleID : userRoleID
    };
      const headers = { 'Content-Type': 'application/json' };
  
    return this.httpClient.put(url, body, { headers });
  }
  
  
  getDataByToken(token: string): Observable<any> {
    const url = `${this.baseUrl}/get-data-by-token`;
      const formData = new FormData();
    formData.append('token', token);
  
    return this.httpClient.post(url, formData);
  }
  isAuthenticated() {
    if (localStorage.getItem("token")) return true;
    return false;
  }

  addNewUser(username: string, password: string, firstName: string, lastName: string,email: string, pictureURL: string, phoneNumber: string, dateOfBirth: Date, timeRegionID: number,userRoleID: number): Observable<any> {
    const url = `${this.baseUrl}`;
  
    const body = {
      Username: username,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PictureURL: pictureURL,
      PhoneNumber: phoneNumber,
      DateOfBirth: dateOfBirth,
      TimeRegionID: timeRegionID,
      UserRoleID: userRoleID 
    };
      const headers = { 'Content-Type': 'application/json' };
  
    return this.httpClient.post(url, body, { headers });
  }

}
