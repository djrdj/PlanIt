import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/user.services';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { NotificationsService } from '../../services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})

export class SigninComponent {
  isSignDivVisiable: boolean  = true;

 
  loginObj: LoginModel = new LoginModel();
  signInClicked: boolean = false;
  errorMsg: string = '';
  constructor(private apiService: ApiService, private router: Router, private cookie: CookieService,private userService: UserService,private toastr:ToastrService,private translateService:TranslateService){}
  selectedLanguage : string = "en";
  ngOnInit(): void 
  {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    localStorage.clear(); 
  }
  
  onLogin(): void {
    //console.log(this.loginObj);
    if (this.loginObj.username && this.loginObj.password) {
      
      this.apiService.login(this.loginObj).subscribe({
        next: (res: any) => {
          const userId = res.id; 

          this.userService.getUserByID(userId).subscribe({
            next: (userRes: any) => {
              if (userRes.activated) {
                this.cookie.set("token", res.token);
                localStorage.setItem("token",res.token)
                localStorage.setItem("email", userRes.email);
                localStorage.setItem("username", res.username);
                localStorage.setItem("fullName", userRes.firstName +" "+ userRes.lastName);
                localStorage.setItem("id", res.id);
                localStorage.setItem("pictureUrl", res.pictureUrl);
                localStorage.setItem("userRoleName", res.userRoleName);
                localStorage.setItem("lang", userRes.language);
                localStorage.setItem("darkMode", userRes.darkTheme);
                this.router.navigateByUrl('/home');
                //console.log(res.token, res.username, res.userRoleName);

              } else {
                this.errorMsg = "Your account is disabled by the administrator.";

              }
      
            },
            error: (userError: any) => {
              console.error('Error occurred while fetching user information:', userError);
              this.errorMsg = "An error occurred while trying to login.";
          
            }
          });
        },
        error: () => {
          this.errorMsg = "Invalid credentials!";
        }
      });
    }
  }
}

export class LoginModel  
{ 
  username: string;
  password: string;

  constructor() {
    this.username = ""; 
    this.password= "";
  }
}
