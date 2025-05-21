import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isSidenavOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isSidenavOpen$: Observable<boolean> = this.isSidenavOpenSubject.asObservable();

  constructor() {}

  setIsSidenavOpen(isOpen: boolean): void {
    this.isSidenavOpenSubject.next(isOpen);
    localStorage.setItem('isSidenavOpen', isOpen.toString());
  }

  getIsSidenavOpen(): boolean {
    const storedIsSidenavOpen = localStorage.getItem('isSidenavOpen');
    return storedIsSidenavOpen !== null ? storedIsSidenavOpen === 'true' : false;
  }
}
