import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class Task_List_Communication_String {
  private stringSubject = new Subject<{ str: string, str2: string }>();

  string$ = this.stringSubject.asObservable();

  sendString(str: string, str2: string) {
    this.stringSubject.next({ str, str2 });
  }
  constructor() { }
}
