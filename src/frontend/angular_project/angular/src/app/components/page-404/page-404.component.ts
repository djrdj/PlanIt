import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'
@Component({
  selector: 'app-page-404',
  templateUrl: './page-404.component.html',
  styleUrl: './page-404.component.scss'
})
export class Page404Component implements OnInit {
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
