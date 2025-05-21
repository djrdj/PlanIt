import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from '../../services/user.services';
import { LoginModel } from '../signin/signin.component';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/Task';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dismiss',
  templateUrl: './dismiss.component.html',
  styleUrl: './dismiss.component.scss'
})
export class DismissComponent implements OnInit {
  @Output() closeOverlayEvent = new EventEmitter<void>();

  @Input() task!: Task;
  @Input() type!: string;

  loginObj: LoginModel = new LoginModel();
  errorMsg: string = '';
  repeatedPassword: string = '';
  display: boolean = false;
  selectedLanguage : string = "en";
  constructor(private toastr: ToastrService, private apiService: ApiService, private projectService: ProjectService,private translateService:TranslateService) { }
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
  this.translateService.use(this.selectedLanguage);
  const isDarkMode = localStorage.getItem('darkMode');
      
  if (isDarkMode) {
    const htmlElement = document.querySelector('.overlay');
    if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
  }
  }

  closeOverlay() {
    this.closeOverlayEvent.emit();
  }

  displayText(): void {
    this.display = true;
  }

  check(): void {
    this.loginObj.username = localStorage.getItem("username") || "";

    this.apiService.login(this.loginObj).subscribe({
      next: (res: any) => {
        console.log(res.token, res.username);
        console.log("Tebra");
        console.log(this.task);
        if (this.type=="Dismiss"){
          this.dismissTask(this.task);
        }
        else if (this.type=="Resolve"){
          this.resolveTask(this.task);
        }
      },
      error: () => {
        this.errorMsg = "Invalid credentials!";
      }
    })
  }
  /*
    dismissTask(){
      this.projectService.getTaskByID(this.taskID).subscribe({
        next:(result:Task)=>
          {
              console.log(result);
              result.status="Dismissed";
              this.updateTask(result);
          },
  
          error:(err:any)=>
          {
              console.log(err);
          }
      })
    }*/

  dismissTask(task: Task) {
    this.projectService.dismissTask(task.assignmentID, Number(localStorage.getItem("id") !)).subscribe({
      next: () => {
        task.status = "Dismissed";
        console.log("Task is dismissed");
        this.closeOverlay();
        //this.reloadDashbaord.ngOnInit()

        this.translateService.get("Task dismissed").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

       
      },

      error: (err: any) => {
        console.log(err);
        this.translateService.get("Task not dismissed. Check for dependecies.").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }

  resolveTask(task: Task){
    this.task.status="Completed";
    this.task.progress=100;
    this.projectService.changeTask(task,Number(localStorage.getItem("id") !)).subscribe({
      next:(result:any)=>
      {
        console.log(result);
        this.closeOverlay();

        this.translateService.get("Task has been resolved").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      },
      
      error:(err:any)=>
      {
        console.log(err);

        this.translateService.get("Task hasn't been resolved").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }


}
