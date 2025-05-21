import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskListAllTasksCommunicationService {
  private signalSubject = new Subject<void>();

  signal$ = this.signalSubject.asObservable();

  sendSignal() {
    this.signalSubject.next();
  }

  constructor() { }
}
