import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../services/profile.service';
import { NotificationsService } from '../../services/notification.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { UserService } from '../../services/user.service';
import { Notification } from '../../models/Notification';

import { TranslateService } from '@ngx-translate/core'
import { ProjectService } from '../../services/project.service';
import { ClockitService } from '../../services/clockit.service';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit{
  @ViewChild('mnotifButton') mnotifButton: ElementRef | undefined;
  @ViewChild('mnotifications') mnotifications: ElementRef | undefined;
  @ViewChild('profileButton') profileButton: ElementRef | undefined;
  @ViewChild('userdropdown') userdropdown: ElementRef | undefined;
  @Input() pageTitle!: string;
  isDarkMode: boolean = false;

  
  loggedUser : string = "";
  userPic : string = "";
  fullName : string = "";
  isSidenavOpen: boolean = false;
  isNotifOpen: boolean = false;
  isUserDropdownOpen: boolean = false;
  role!:string;
  notifications: any[] = [];
  userId: number = 0;
  selectedLanguage : string = "en";
  notifCount: number = 0;
  constructor(private router: Router, private cookie: CookieService, private profileService: ProfileService, private renderer: Renderer2, 
    private darkModeService : DarkModeService, public notificationService:NotificationsService,private translateService:TranslateService,
  private userService : UserService , private projectService : ProjectService, private clockITService : ClockitService) {

  }

  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    if (typeof localStorage !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode');
      
      if (isDarkMode) {
        const htmlElement = document.querySelector('#layoutHead');
        if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
      }
      // Subscribe to dark mode changes
      this.darkModeService.darkModeSubject.subscribe(isDarkMode => {
        this.isDarkMode = isDarkMode;
        document.querySelector('#layoutHead')?.classList.toggle('dark', JSON.parse(isDarkMode.toString()));
      });
      this.loggedUser = localStorage.getItem('username') as string;
      this.userPic = localStorage.getItem('pictureUrl') as string;
      this.userId = Number(localStorage.getItem('id'));

      this.role=localStorage.getItem('userRoleName') as string;
      this.updateProfilePicture();
      this.profileService.profilePictureChanged.subscribe((url: string) => {
        this.updateProfilePicture();
      });
    }
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;

      const notificationPromises = this.notifications.map(notification => {
        return this.userService.getUserByID(notification.senderID).toPromise().then(userInfo => {
          notification.senderInfo = userInfo;
          // console.log("_----------------");
          // console.log(this.notificationService.notifications);
          // console.log(this.notificationService.getNotificationType(notification.notificationType))
          // console.log("-------------------");
          return notification;
        });
      });

      Promise.all(notificationPromises).then(updatedNotifications => {
        this.notifications = updatedNotifications;
        console.log(this.notifications); // Now each notification has senderInfo
      }).catch(error => {
        console.error('Error fetching user info', error);
      });

      this.notifications.forEach(notification => {
        if (notification.notificationType === 1) {
          notification.message = ' left comment ';
        } else {
          notification.message = 'did something'; // TO DO
        }
      });
      console.log(this.notifications);
      //this.notifCount=this.notifications.length;
    });
    //console.log("user",this.loggedUser);
  }

  ngAfterViewInit() {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.mnotifButton && this.mnotifications) {
        if (
          e.target !== this.mnotifButton.nativeElement &&
          e.target !== this.mnotifications.nativeElement &&
          !this.mnotifications.nativeElement.contains(e.target)
        ) {
          this.isNotifOpen = false;
        }
      }

      if (this.profileButton && this.userdropdown) {
        if (
          e.target !== this.profileButton.nativeElement &&
          e.target !== this.userdropdown.nativeElement &&
          !this.userdropdown.nativeElement.contains(e.target)
        ) {
          this.isUserDropdownOpen = false;
        }
      }
    });
    
  }
  
  onDarkModeToggled(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
    
    const htmlElement = document.querySelector('#layoutHead');
    if (htmlElement) htmlElement.classList.toggle('dark', isDarkMode);
    
  }
  updateProfilePicture(): void {
    const pictureUrl = localStorage.getItem('pictureUrl');
    if (pictureUrl) {
      this.userPic = `${pictureUrl}?${new Date().getTime()}`;
    }
  }
  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  toggleNotifications() {
    this.isNotifOpen = !this.isNotifOpen;
    this.notificationService.getNotifications();
  }

  toggleUserDropdown() {
    this.fullName = localStorage.getItem('fullName') as string;
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onLogoff() {
    
    this.cookie.delete('token', '/');
    console.log("Obrisao sam cookie");
    localStorage.clear();
    console.log("Obrisao sam lcoal");
    this.getEntries();
    this.notificationService.stopHubConnection();
    this.router.navigate(['/signin']);
  }
  /*-------------- CLOCKIT STARTS --------------------*/
  getEntries() : void{
    this.clockITService.getUserTimeEntries(this.userId).subscribe({
      next:async (rezultat: any[])=>
      {
        console.log(rezultat);

        const entries = rezultat.map(element => {
          element.timeEntry.hours = Math.floor(element.timeEntry.durationInMinutes / 60);
          return element;
        }).sort((a, b) => {
          const endTimeA = new Date(a.timeEntry.endTime).getTime();
          const endTimeB = new Date(b.timeEntry.endTime).getTime();
          return endTimeA - endTimeB;
        });

        const runningEntries = entries.filter((entry) => !entry.timeEntry.endTime);
        for (const entry of runningEntries) {
          console.log('Stoping task ', entry);
          await this.stopTask(entry.timeEntry.timeEntryID);
        }
      },
      error:(err:any)=>
      {
          console.log(err)
      }
    });
  }
  stopTask(timeEntryId: number): any {
    
    this.clockITService.endEntry(timeEntryId).subscribe({
      next: (res) => {
        console.log(res);
        localStorage.removeItem('startTime');
        localStorage.removeItem('elapsedTime');
          
      },
      error: (err) => {
        
      }
    });
  }
  /*--------------------- CLOCKIT ENDS --------------------*/
  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }
  getNotificationTitle(notification:any){
    switch(notification.notificationType){
      case 0:
        return "Attachment upload";
      case 1:
        return "Comment";
      case 2:
        return "Task assign";
      case 3:
        return "Project assign";
      default:
        return "";
    }
  }
  getNotificationMessage(notification:any){
  //   console.log(notification);

  //   this.userService.getUserByID(notification.UserID)
  //   .subscribe((response:any)=>{
  //     console.log(response);
  //   });
  // }
  }

  redirect(notif:any){
    if (notif.assignmentId)
      this.redirectToAssignment(notif);
    else if (notif.projectId)
      this.redirectToProject(notif);
  }

  redirectToAssignment(notif:any)
  {
    this.projectService.getAssigmentByAssigmentId(notif.assignmentId).subscribe({
      next:(result:any)=>
      {
        this.router.navigate(['/home', notif.projectId , result.assignmentListID, result.projectName, result.assignmentListName, result.assignmentID, result.assignmentName,'taskpage']);
        
      },
      error:(err:any)=>
      {
        console.log(err)
      }
    })
  }

  redirectToProject(notif:any){
    this.projectService.getProject(notif.projectId).subscribe({
      next:(result:any)=>
      {
        this.router.navigate(['/home', notif.projectId , '-', result.projectName,'-','view']);
      },

      error:(err:any)=>
      {
        console.log(err);
      }
    })
  }

}
