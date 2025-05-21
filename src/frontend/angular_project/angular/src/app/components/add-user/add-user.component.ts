import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../../services/user.services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit{
  email: string = "";
  username: string = "";
  password: string = "";
  firstName: string = "";
  lastName: string = "";
  pictureURL: string = "";
  phoneNumber: string = "";
  dateOfBirth: Date = new Date();
  timeRegionID: number = 1;
  userRoleID: number = 3;//userRoleID -> employee po defaultu
  selectedLanguage : string = "en";
  @Output() closeOverlayEvent = new EventEmitter<void>();
  closeOverlay() {
    this.closeOverlayEvent.emit();
  }

  

  toggleRole(role: number): void {
    this.userRoleID = role;
    console.log(this.userRoleID);
  }

  constructor(private toastr: ToastrService,private apiService:ApiService,private translateService:TranslateService){}
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }
  // sendRegistrationEmail():void {
  //   console.log(this.email, this.username);
  //   this.apiService.sendRegMail(this.email, this.username).subscribe({
  //     next:(res: any) =>{
  //       this.toastr.success("Mail has been sent","Success",{
  //         positionClass: 'toast-top-center',
  //         timeOut: 1500
  //      });
  //       // this.closeOverlay();
  //       this.apiService.addNewUser(this.username, this.password, this.firstName, this.lastName,this.email, this.pictureURL, this.phoneNumber, this.dateOfBirth, this.timeRegionID,this.selectedRole).subscribe({
  //         next:(res: any) =>{
  //           console.log("result-->>",res);
  //           this.toastr.success("User has been added","Success",{
  //             positionClass: 'toast-top-center',
  //             timeOut: 1500
  //          });
  //           this.closeOverlay();
  //         },
  //         error: (error) => {
  //           console.log(error);
  //           this.toastr.error("User was not added","Error",{
  //             positionClass: 'toast-top-center',
  //             timeOut: 1500 
  //          });
  //         }
  //       })
  //     },
  //     error: (error) => {
  //       this.toastr.error("Mail was not sent","Error",{
  //         positionClass: 'toast-top-center',
  //         timeOut: 1500 
  //      });
  //     }
  //   })
  // }

  sendRegistrationEmail():void {
    console.log("Selected Role:", this.userRoleID);
    // this.apiService.addNewUser(this.username, this.password, this.firstName, this.lastName,this.email, this.pictureURL, this.phoneNumber, this.dateOfBirth, this.timeRegionID,this.userRoleID).subscribe({
    //   next:(res: any) =>{
    //     console.log("result-->>",res);
    //     this.toastr.success("User has been added","Success",{
    //       positionClass: 'toast-top-center',
    //       timeOut: 1500
    //    });
    //    console.log(this.email, this.username);
    this.apiService.sendRegMail(this.email, this.username, this.userRoleID).subscribe({
      next:(res: any) =>{

        this.translateService.get("Mail has been sent").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
        this.closeOverlay();
      },

      

      error: (error) => {

        this.translateService.get("Mail was not sent").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      this.closeOverlay();
      },
    }); 
  }

 
 
}
