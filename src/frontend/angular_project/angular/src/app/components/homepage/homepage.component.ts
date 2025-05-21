import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {

  selectedLanguage : string = "en";
  role!:string
  ngOnInit(): void {
    this.role=localStorage.getItem('userRoleName') as string
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }
  constructor(private translateService:TranslateService){}

}
