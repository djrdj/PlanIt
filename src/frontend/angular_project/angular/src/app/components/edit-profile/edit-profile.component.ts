import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit{
  userId: number=0;
  user: User={
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
    activated: 0,
    darkTheme: 0,
    token : ''
  };
  selectedFile!: File;
  pictureToShow: string='';
  isAdmin: boolean = false;
  selectedLanguage : string = "en";
  userForm!: FormGroup;
  constructor(private toastr: ToastrService, private userService: UserService, private router: Router, private cookie: CookieService, private profileService: ProfileService, private location: Location,private translateService:TranslateService ,private formBuilder: FormBuilder ) { 
     this.userForm=this.formBuilder.group({
      firstName: ['', Validators.pattern('[a-zA-ZžŽđĐšŠčČćĆ\s]*')],
      lastName: ['', Validators.pattern('[a-zA-ZžŽđĐšŠčČćĆ\s]*')]
     });
  }
  

  onProfileImageClicked(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: any) {
    console.log(event.target.files);
    this.selectedFile = event.target.files[0];
    console.log('Selected File:', this.selectedFile);
    this.onUpload();
  }



  ngOnInit(): void {
    // this.getUserByID(Number(this.cookie.get("id")));
    // const id = localStorage.getItem("id");
    // if (id) 
    // {
    //   this.getUserByID(Number(id));
    //   this.pictureToShow = "../../../assets/profilepics/" + (localStorage.getItem("pictureUrl") || '');
    // } 
    // else 
    // {
    //   console.log("User not found");
    // }

    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.userId=Number(this.getUserIdFromUrl(this.router.url.toString()));
    this.getUserByID(this.userId);
    
    this.profileService.profilePictureChanged.subscribe((pictureUrl: string) => {
      console.log("Subscription called");
      const updatedUser = { ...this.user, pictureUrl: `${pictureUrl}?${new Date().getTime()}` };
      this.user = updatedUser;
    });

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('#edit_profile_html');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }

    if (localStorage.getItem('userRoleName')=="Administrator")
      this.isAdmin = true;


  }

  onUpload() {
    this.userService.uploadImage(this.user.userID, this.selectedFile).subscribe({
      next:(result:any)=>
      {
        this.user.pictureUrl=result.imageUrl;
        console.log(this.user.pictureUrl);
        // this.cookie.set("pictureUrl", this.user.pictureUrl);
        if(this.userId==Number(localStorage.getItem("id")))
          localStorage.setItem("pictureUrl", this.user.pictureUrl);
        

        const uniqueParam = new Date().getTime(); // Generate a unique value (timestamp)
        this.pictureToShow = `../../../assets/profilepics/${this.user.pictureUrl}?${uniqueParam}`;
        
        this.profileService.profilePictureChanged.emit(this.user.pictureUrl);

        this.translateService.get("Profile picture uploaded.").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

      },
      error:(err:any)=>
      {
        this.router.navigate(["error"]);
          console.log(err);
          this.translateService.get("Profile picture upload failed.").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
          
      }
    });

  
  }
 
  getUserByID(userID:number){
    this.userService.getUserByID(userID).subscribe({
      next:(result:User)=>
        {
            //console.log(result);
            this.user=result;
            this.pictureToShow = "../../../assets/profilepics/" + (this.user.pictureUrl || '');
        },

        error:(err:any)=>
        {
          this.router.navigate(["error"]);
            console.log(err);
        }
    })
  }

  changeUserByID(userID:number,user:User){
   
    this.userService.changeUserByID(userID,user).subscribe({
      next:(result:any)=>
        {
            //console.log(result);
            if(this.userId==Number(localStorage.getItem("id")))
              localStorage.setItem("fullName", user.firstName +" "+ user.lastName);


            this.translateService.get("User has been changed").subscribe((translatedMessage: string) => {
              this.toastr.success(translatedMessage, 'Success', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });

          //  this.router.navigate([`profile/${localStorage.getItem('id')}`]);
          this.location.back();
        },

        error:(err:any)=>
        {
          this.router.navigate(["error"]);
            console.log(err);

            this.translateService.get("User was not changed").subscribe((translatedMessage: string) => {
              this.toastr.error(translatedMessage, 'Error', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
        }
    })
  }

  goBack() {
    //this.router.navigate([`profile/${this.userId}`]);
    this.location.back();
  }

  private getUserIdFromUrl(url:string):string{
    const parts = url.split('/');
    console.log('ovo je to 2 ',parts);
    return parts[2];
  }

}
