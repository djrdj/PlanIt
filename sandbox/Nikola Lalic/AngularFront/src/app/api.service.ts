import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string = 'http://localhost:5199/api/auth';

  constructor(private readonly httpClient: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginData = { "username": username, "password": password };
    const url = `${this.baseUrl}/login`;

    return this.httpClient.post(`${this.baseUrl}/login`, loginData);
  }
}
