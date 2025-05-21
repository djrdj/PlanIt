import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profilePictureChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }
}
