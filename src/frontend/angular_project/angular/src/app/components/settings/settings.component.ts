import { Component } from '@angular/core';
import { DarkModeService } from '../../services/dark-mode.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { timeout } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  isDarkMode: boolean = false;
  constructor(private darkModeService: DarkModeService, private router: Router, private toastr: ToastrService, private translateService:TranslateService, private userService : UserService) {}
  fullName : string = "";
  email:string="";
  id!:string;
  userId!:number;
  userRoleName: string = "";
  selectedLanguage : string = "en";


  ngOnInit(): void
  {
    this.fullName=localStorage.getItem("fullName") as string;
    this.email=localStorage.getItem("email") as string;
    this.id=localStorage.getItem('id')as string;
    this.userId=parseInt(this.id);
    this.userRoleName=localStorage.getItem("userRoleName") as string;

    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    
    this.isDarkMode = this.darkModeService.getDarkMode();
    
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode) document.querySelector('html')?.classList.toggle('dark', JSON.parse(isDarkMode));
    console.log(this.email)
  }

  toggleDarkMode(event: Event)
  {
    console.log("Changing to...");
    const darkModeToggle = event.target as HTMLInputElement;
    const isDarkMode = darkModeToggle.checked;
    const id = localStorage.getItem('id');
    console.log(isDarkMode);

    if (!id) return;
   
    this.updateDarkMode(parseInt(id,10),isDarkMode);
    
    document.querySelector('html')?.classList.toggle('dark', isDarkMode);
    //this.darkModeSubject.next(isDarkMode==1);
  }

  isDarkModeActive(): boolean 
  {
    return this.darkModeService.getDarkMode();
  }

  updateDarkMode(userId:number,mode: boolean){
    const themeId: number = mode ? 1 : 0;
    this.darkModeService.setDarkMode(userId,themeId).subscribe({
      next:()=>
      {

        this.translateService.get("Theme has been changed").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      },

      error:(err:any)=>
      {

        this.translateService.get("Theme was not updated").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

       
      }
    })
  }
  onLanguageChange(event: any) {
    const newSelectedLang = event.target.value;
    console.log("Changing to...", newSelectedLang); 

    this.updateLanguage(parseInt(this.id,10), newSelectedLang);

    localStorage.setItem('lang', newSelectedLang) ;
    this.selectedLanguage = newSelectedLang;
    this.translateService.use(this.selectedLanguage);
  }
  updateLanguage(userId:number, language: string){
    
    this.userService.updateLangugage(userId,language).subscribe({
      next:()=>
      {

        this.translateService.get("Language has been changed").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

      },

      error:(err:any)=>
      {

        this.translateService.get("Language was not updated").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }
}
