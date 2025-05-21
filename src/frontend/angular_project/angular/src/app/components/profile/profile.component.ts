import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../services/profile.service';
import { SidebarService } from '../../services/sidebar.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core'
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})

export class ProfileComponent implements OnInit{
  userId: number=0;
  user: User ={
    userID: 0,
    username: '',
    password: '',
    firstName: '',
    phoneNumber: '',
    pictureUrl: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    timeRegionID: 0,
    userRoleID: 0,
    activated: 0
  };
  role:any;
  constructor(private userService: UserService, private cookie: CookieService, private profileService : ProfileService, private sidebarService: SidebarService, private router: Router, private location: Location,private translateService:TranslateService) { }
  isDarkMode : boolean = false;
  authorized: boolean = false;
  selectedLanguage : string = "en";

  ngOnInit(): void {
    // this.getUserByID(Number(this.cookie.get("id")));
    // const id = localStorage.getItem("id");
    // if (id)  this.getUserByID(Number(id));
    // else console.log("User not found");
    this.userId=Number(this.getUserIdFromUrl(this.router.url.toString()));
    this.getUserByID(this.userId);
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
     // Subscribe to profile picture changes
    this.profileService.profilePictureChanged.subscribe((pictureUrl: string) => {
      console.log("Subscription called");
      const updatedUser = { ...this.user, pictureUrl: `${pictureUrl}?${new Date().getTime()}` };
      this.user = updatedUser;
    });

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('#profile_html');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    // console.log("Profile of " + this.user.userRoleID);
    if (this.userId == Number(localStorage.getItem("id"))) this.authorized = true;
    
  }
  
  getUserByID(userID:number){
    this.userService.getUserByID(userID).subscribe({
      next:(result:User)=>
        {
            this.user=result;
            console.log(this.user);
            if (localStorage.getItem("userRoleName") == "Administrator" && result.userRoleID !=1) this.authorized = true;
            this.getUserRoleByID(result.userRoleID);
        },

        error:(err:any)=>
        {
          this.router.navigate(["error"]);
            console.log(err);
        }
    })
  }

  getUserRoleByID(id:number){
    this.userService.getUserRoleByID(id).subscribe({
      next:(result:any)=>
        {
          this.role=result.userRoleName;
          //console.log(this.role);
        },

        error:(err:any)=>
        {
          this.router.navigate(["error"]);
            console.log(err);
        }
    })
  }

  goBack() {
    this.location.back();
  }

  private getUserIdFromUrl(url:string):string{
    const parts = url.split('/');
    console.log('ovo je to 2 ',parts);
    return parts[2];
  }

  imageRedirect(userId: number | undefined){
    this.router.navigate(['/edit-profile/',userId]);
  }
  
}
