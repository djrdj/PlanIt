import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  selectedLanguage: string = "en";
  role!: string;

  constructor(
    private router: Router,
    public notificationService: NotificationsService,
    private userService: UserService,
    private translateService: TranslateService,
    private projectService: ProjectService
  ) {}

  markedNotifications: any[] = [];

  generateInfo(notification: any) {
   // console.log(notification.userID);
    // this.userService.getUserByID(notification.userID).subscribe((response:any)=>{
    //   console.log(response);
    // })
  }

  toList(notificationId: any) {
    if (this.markedNotifications.includes(notificationId)) {
      this.markedNotifications = this.markedNotifications.filter(id => id !== notificationId);
    } else {
      this.markedNotifications.push(notificationId);
    }
   // console.log(notificationId);
  }

  read_notifications() {
    this.notificationService.read_notifications(this.markedNotifications);
   // console.log(this.markedNotifications);
    this.markedNotifications = [];
  }

  ngOnInit(): void {
    this.role = localStorage.getItem('userRoleName') as string;
    
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode) {
      const htmlElement = document.querySelector('.notif-html');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }

    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  }
  
  ngAfterViewInit(){
    setTimeout(() => {this.notificationService.getAllNotifications();}, 500);
  }

  imageRedirect(userId: number | undefined) {
    this.router.navigate(['/profile/', userId]);
  }

  readNotification(notification:any){
    if (!notification.read){
      console.log(notification.notificationID);
      this.notificationService.read_notifications([notification.notificationID]);
      this.notificationService.getAllNotifications();
    }
    
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