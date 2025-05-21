// dark-mode.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment.production';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  darkModeSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private http:HttpClient) {}

  // Method to get current dark mode state
  getDarkMode(): boolean {
    const isDarkMode = localStorage.getItem('darkMode');
    return isDarkMode ? JSON.parse(isDarkMode) : false;
  }

  // Method to set dark mode state
  setDarkMode(userID : number, isDarkMode: number): Observable<any>{ 
 
    localStorage.setItem('darkMode', isDarkMode.toString());
  
    this.darkModeSubject.next(isDarkMode==1);

    return this.http.put<any>(`${environment.apiUrl}/user/update-dark-theme?userID=${userID}&DarkTheme=${isDarkMode}`,"");

                                                    //      /update-dark-theme?userID=8&DarkTheme=0
  }
  

  // Method to toggle dark mode state
  toggleDarkMode(userID: number): Observable<any> {
    const currentDarkMode = this.getDarkMode();
    const newDarkMode = currentDarkMode ? 0 : 1; // Toggle between 0 and 1
    return this.setDarkMode(userID, newDarkMode);
  }

}
