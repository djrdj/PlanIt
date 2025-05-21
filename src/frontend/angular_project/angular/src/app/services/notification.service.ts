import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment.production';
import { UserService } from './user.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  apiUrl = environment.apiUrl;
  hubUrl = this.apiUrl.replace('/api', '') + '/notificationHub';
  newNotifications: boolean = false;
  private hubConnection?: HubConnection;

  notifications: any[] = [];
  allNotifications: any[] = [];
  allnotifications_parsed: any[] = [];
  role!: string;

  private notificationsSubject = new Subject<any[]>();
  notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private toastr: ToastrService,
    private cookie: CookieService,
    private userservice: UserService,
    private translateService: TranslateService 
  ) { }

  createHubConnection() {
    this.role = localStorage.getItem('userRoleName') as string;

    if (this.role === 'Administrator') {
      return;
    }

    var token = this.cookie.get("token");
    //var token=localStorage.getItem("token")
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token ? token : ''
      })
      .withAutomaticReconnect([0, 3000, 5000])
      .build();

    this.hubConnection.start().catch(error => {
      console.log(error);
    });

    this.hubConnection.on('newNotifications', () => {
      this.translateService.get("You have unread notifications!").subscribe((translatedMessage: string) => {
        this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
                  timeOut: 1500
        });
      });
        this.newNotifications = true;
    });

    this.hubConnection.on('Notify', (notification: any) => {
      this.notifications.push(notification);
      this.allNotifications.push(notification);
      this.newNotifications = true;

      this.translateService.get("You have new notification!").subscribe((translatedMessage: string) => {
        this.toastr.success(translatedMessage, 'Success', {
          positionClass: 'toast-top-right',
          timeOut: 1500
        });
      });

      this.notificationsSubject.next(this.notifications);
      console.log(notification);
    });

    this.hubConnection.on('recieveNotifications', (notifications: [Notification]) => {
      this.notifications = notifications;
      this.newNotifications = false;
      this.notificationsSubject.next(this.notifications);
    });

    this.hubConnection.on('recieveAllNotifications', (notifications: [Notification]) => {
      this.allNotifications = notifications;
      this.allNotifications.forEach((notification: any) => {
        this.userservice.getUserByID(notification.senderID).subscribe((response: any) => {
          console.log(response);
          this.allnotifications_parsed.push(
            {
              notification,
              response
            }
          );
        });
      });
      console.log("RECIEVED", this.allnotifications_parsed);
    });
  }

  stopHubConnection() {
    if (this.role !== 'Administrator') {
      this.hubConnection?.stop().catch(error => console.log(error));
    }
  }

  async getNotifications() {
    if (this.role !== 'Administrator') {
      await this.hubConnection?.invoke('invokeGetNotifications');
      this.newNotifications = false;
    }
  }

  async getAllNotifications() {
    if (this.role !== 'Administrator') {
      this.allNotifications = [];
      this.allnotifications_parsed = [];
      await this.hubConnection?.invoke('invokeGetAllNotifications');
    }
  }

  read_notifications(notificationIds: number[]) {
    if (this.role !== 'Administrator') {
      this.hubConnection?.invoke("readNotifications", notificationIds);
    }
  }


  getNotificationType(type: any): any {
    //console.log("type",type);
    let text;
    switch (type) {
      case 2:
        this.translateService.get("gave you new task").subscribe((translation: string) => {
          text=translation;
        });
        break;
      case 3:
        this.translateService.get("added you to new project").subscribe((translation: string) => {
          text=translation;
        });
        break;
      case 4:
        this.translateService.get("removed you from project").subscribe((translation: string) => {
          text=translation;
        });
        break;
      case 5:
        this.translateService.get("removed you from assignment").subscribe((translation: string) => {
          text=translation;
        });
        break;
      default:
        this.translateService.get("commented on a task").subscribe((translation: string) => {
          text=translation;
        });
        break;
    }
    return text;
  }


  getsender(notification: any) {
    this.userservice.getUserByID(notification.userID).subscribe((response: any) => {
      return response.username;
    });
  }
}