import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProjectCommunicationServiceService {
  private stringSubject = new Subject<string>();

  string$ = this.stringSubject.asObservable();

  sendString(str: string) {
    this.stringSubject.next(str);
  }
  constructor() { }
}
