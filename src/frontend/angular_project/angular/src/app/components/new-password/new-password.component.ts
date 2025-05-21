import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/user.services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent implements OnInit {
  isSignDivVisiable: boolean  = true;
  selectedLanguage : string = "en";
  loginObj: LoginModel  = new LoginModel();
  newPassword: string = '';
  repeatnewPassword: string ='';
  passwordsDoNotMatch: boolean = false;

  constructor(private router: Router, private apiService: ApiService, private route: ActivatedRoute, private toastr:ToastrService,private translateService:TranslateService){}
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }
  resetPassword():void {
    const token = this.route.snapshot.queryParamMap.get('token')!;
    console.log(token, this.newPassword);
    if(this.newPassword == this.repeatnewPassword)
    {
      this.passwordsDoNotMatch = false;
      this.apiService.resetPassword(token, this.newPassword).subscribe({
        next:(res: any) =>{
          

          this.translateService.get("Password reseted successfully").subscribe((translatedMessage: string) => {
            this.toastr.success(translatedMessage, 'Success', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });

          this.router.navigateByUrl('/signin');
         
        },
        error: (error) => {

          this.translateService.get("Password was not reseted").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
          console.log("Error: ",error);
        }
      })
    }
    else
    {
      this.passwordsDoNotMatch = true;
      console.log("Sifre nisu iste! ");
    }
  }
}


  
  export class LoginModel  { 
  username: string;
  password: string;
  
  constructor() {
    this.username = ""; 
    this.password= ""
  }
  
  }
