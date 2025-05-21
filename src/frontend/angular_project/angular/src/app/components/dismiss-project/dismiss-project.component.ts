import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { ApiService } from '../../services/user.services';
import { Project } from '../../models/project';
import { LoginModel } from '../signin/signin.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dismiss-project',
  templateUrl: './dismiss-project.component.html',
  styleUrl: './dismiss-project.component.scss'
})
export class DismissProjectComponent implements OnInit{



  @Output() closeOverlayEvent = new EventEmitter<void>();

  @Input() project!: Project;

  loginObj: LoginModel = new LoginModel();
  errorMsg: string = '';
  repeatedPassword: string = '';
  display: boolean = false;
  selectedLanguage : string = "en";
  constructor(private toastr: ToastrService, private apiService: ApiService, private projectService: ProjectdashboardService,private translateService:TranslateService) { }

  ngOnInit(): void {
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
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
        console.log(this.project);
        this.dismissProject(this.project);
      },
      error: () => {
        this.errorMsg = "Invalid credentials!";
      }
    })
  }


  dismissProject(project:Project) {
    this.projectService.dismissProject(project.projectID,Number(localStorage.getItem("id") !)).subscribe({
      next: () => {
        project.status = "Dismissed";
        console.log("Project is dismissed");
        this.closeOverlay();

        this.translateService.get("Project dismissed").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      },

      error: (err: any) => {
        this.translateService.get("Project not dismissed").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, "Error", {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }

}
