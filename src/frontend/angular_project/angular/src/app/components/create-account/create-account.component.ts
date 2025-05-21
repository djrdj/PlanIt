import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/user.services';
import { ToastrService } from 'ngx-toastr';
import { LoginModel } from '../signin/signin.component';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit{
  email: string="";
  username: string="";
  password: string="";
  firstName: string="";
  lastName: string="";
  phoneNumber: string="";
  day: number =0;
  month: string = "";
  year: number = 0;
  currentYear!: number;
  maxDaysInMonth!: number;
  timeZone: number = 0;
  repeatpassword: string = "";
  userRoleID : number = 0;
  passwordsDoNotMatch : boolean = false;
  phoneNumberError:boolean = false;
  selectedLanguage : string = "en";
  constructor(private http: HttpClient, private route: ActivatedRoute, private apiService: ApiService, private toastr: ToastrService, private router : Router, private cookie: CookieService, private userService : UserService,private translateService:TranslateService) { }


  register(): void {
    const token = this.route.snapshot.queryParamMap.get('token')!;
    if(this.password == this.repeatpassword)
    {
      this.passwordsDoNotMatch = false;
      this.apiService.registerNewUser(token, this.password, this.firstName, this.lastName, this.phoneNumber, this.day, this.month, this.year, this.timeZone, this.userRoleID)
      .subscribe({
        next: (res: any) => {

          this.apiService.login({username: this.email, password:this.password}).subscribe({
            next: (loginRes: any) => {
             
              this.userService.getUserByID(loginRes.id).subscribe({
                next: (userRes: any) => {
                  console.log(userRes);
                  if (userRes.activated) {
                    this.cookie.set("token", userRes.token);
                    localStorage.setItem("email", userRes.email);
                    localStorage.setItem("username", userRes.username);
                    localStorage.setItem("fullName", userRes.firstName +" "+ userRes.lastName);
                    localStorage.setItem("id", userRes.userID);
                    localStorage.setItem("pictureUrl", userRes.pictureUrl);
                    localStorage.setItem("userRoleName", loginRes.userRoleName);
                    localStorage.setItem("darkMode", userRes.darkTheme);
                    localStorage.setItem("lang", userRes.language);
                    localStorage.setItem("token",res.token)
                    console.log(loginRes.token, loginRes.username, loginRes.userRoleName);
                    this.router.navigate(['/profile/', userRes.userID]);
                  } 
                  else {

                    this.translateService.get("Login failed").subscribe((translatedMessage: string) => {
                      this.toastr.error(translatedMessage, 'Error', {
                        positionClass: 'toast-top-right',
                        timeOut: 1500
                      });
                    });


                  }
                }
              });
              console.log(res);
              console.log(loginRes);

              this.translateService.get("User registered and logged in successfully").subscribe((translatedMessage: string) => {
                this.toastr.success(translatedMessage, 'Success', {
                  positionClass: 'toast-top-right',
                  timeOut: 1500
                });
              });

              
            },
            error: (loginError) =>{
              console.log("Login failed:", loginError);

              this.translateService.get("Login failed. Please try again later.").subscribe((translatedMessage: string) => {
                this.toastr.error(translatedMessage, 'Error', {
                  positionClass: 'toast-top-right',
                  timeOut: 1500
                });
              });
            }
          });
          
        },
        error: (error) => {
          console.log(token, this.password, this.firstName, this.lastName, this.phoneNumber, this.day, this.month, this.year, this.timeZone);
          console.log("Error: ", error);

          this.translateService.get("Registration failed. Please check all your data").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
          
        }
      });
    }
    else
    {
      this.passwordsDoNotMatch = true;
    }
  }



  

  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.loadDataFromAPI();
    this.currentYear=new Date().getFullYear();
    this.updateMaxDays()
  }

  loadDataFromAPI(): void {
    const token = this.route.snapshot.queryParamMap.get('token')!;
    console.log(token);
    
    this.apiService.getDataByToken(token).subscribe({
      next: (res: any) => {
        console.log(res);
        console.log("test");
        this.email = res.email;
        this.username = res.username;
        this.userRoleID = res.userRoleID;
      },
      error: (error) => {
      //   this.toastr.error("Error occured. Please try again later.","Error",{
      //     positionClass: 'toast-top-center',
      //     timeOut: 1500 
      //  });
        console.log("Error: ", error);
      }
    });
  }

  updateMaxDays() {
    const monthIndex = this.getMonthIndex();
    if (monthIndex === 2) {
      if (this.isLeapYear()) {
        this.maxDaysInMonth = 29; 
      } else {
        this.maxDaysInMonth = 28; 
      }
    } else if ([4, 6, 9, 11].includes(monthIndex)) {
      this.maxDaysInMonth = 30; 
    } else {
      this.maxDaysInMonth = 31;
    }
}

  isLeapYear(): boolean {
    return (this.year % 4 === 0 && this.year % 100 !== 0) || (this.year % 400 === 0);
  }

  getMonthIndex(): number {
    return new Date(Date.parse(this.month + " 1, " + this.year)).getMonth() + 1;
  }

  validatePhoneNumber() {
    const phoneNumberRegex = /^[0-9]+$/; // Regularni izraz koji dopušta samo brojeve

    // Provjeri unos broja telefona
    if (!phoneNumberRegex.test(this.phoneNumber)) {
        this.phoneNumberError = true; // Postavi flag za prikazivanje greške
    } else {
        this.phoneNumberError = false; // Ako je unos ispravan, sakrij grešku
    }
}

}
