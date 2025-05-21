import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-edit-permissions',
  templateUrl: './edit-permissions.component.html',
  styleUrl: './edit-permissions.component.scss'
})
export class EditPermissionsComponent implements OnInit  {
  @Input() username: string = ''; 
  @Output() closeOverlayEvent = new EventEmitter<void>();
  closeOverlay() {
    this.closeOverlayEvent.emit();
  }
  selectedLanguage : string = "en";
  constructor(private translateService:TranslateService){}
  ngOnInit(): void {
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }
}
