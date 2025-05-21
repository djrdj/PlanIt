import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-ganttchart',
  templateUrl: './ganttchart.component.html',
  styleUrl: './ganttchart.component.scss'
})
export class GanttchartComponent {
  selectedLanguage : string = "en";
  isDarkMode : boolean = false;
  constructor(private translateService:TranslateService){};
  ngOnInit():void{
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('#gant_html');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }
}
