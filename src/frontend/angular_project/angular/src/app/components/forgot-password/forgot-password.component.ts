import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/user.services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  isSignDivVisiable: boolean  = true;
  emailForReset: string='';
  signUpObj: SignUpModel  = new SignUpModel();
  loginObj: LoginModel  = new LoginModel();
  selectedLanguage : string = "en";

  constructor(private router: Router, private apiService:ApiService, private toastr : ToastrService,private translateService:TranslateService){}
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }
  sendEmail():void {
    console.log(this.emailForReset);
    this.apiService.sendResetPasswordMail(this.emailForReset).subscribe({
      next:(res: any) =>{

        this.translateService.get("Email sent successfully").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

      
      },
      error: (error:any) => {

        this.translateService.get("This user doesn't exist").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }
}

export class SignUpModel  {
  name: string;
  email: string;
  password: string;
  
  constructor() {
    this.email = "";
    this.name = "";
    this.password= ""
  }
  }
  
  export class LoginModel  { 
  email: string;
  password: string;
  
  constructor() {
    this.email = ""; 
    this.password= ""
  }
  
  }
