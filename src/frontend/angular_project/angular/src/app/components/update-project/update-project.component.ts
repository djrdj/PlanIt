import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from '../../models/project';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { ProjectDashboardComponent } from '../project-dashboard/project-dashboard.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-update-project',
  templateUrl: './update-project.component.html',
  styleUrl: './update-project.component.scss'
})
export class UpdateProjectComponent implements OnInit{

  selectedLanguage : string = "en";
  @Output() closeOverlayEvent = new EventEmitter<void>();
  closeOverlay() {
    this.closeOverlayEvent.emit();

  }
  
  @Input() id!:number;
 
  constructor(private toastr: ToastrService,private projectdasboardService:ProjectdashboardService,private reloadDashboard:ProjectDashboardComponent,private translateService:TranslateService){}

  ngOnInit(): void {
    this.getProjectID(this.id);
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }

  
  projectName!:string;
 description!:string
 projectID!:number 
 endDate!:Date |string ;
 startDate!:Date | string;
status!:string
projectLeaderID!:number


  project:any={
    projectName: this.projectName,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    projectID: this.projectID,
    status:this.status,
    projectLeaderID:this.projectLeaderID
  }

  userIdsToAdd: number[] = [];
  userIdsToRemove: number[] = [];

  userIdsToAddHandler(array: any){
    this.userIdsToAdd=array;
  }

  userIdsToRemoveHandler(array: any){
    this.userIdsToRemove=array;
  }


  updateProject(project:Project){
    console.log("useri za dodavanje",this.userIdsToAdd);
    console.log("useri za uklanjanje",this.userIdsToRemove);
    project.employeeIdsToAdd=this.userIdsToAdd;
    project.employeeIdsToRemove=this.userIdsToRemove;
    this.projectdasboardService.updateProject(project,Number(localStorage.getItem("id") !)).subscribe({


      next:()=>
      {
       this.closeOverlay()
       this.reloadDashboard.ngOnInit()
         console.log(project)
        
         this.translateService.get("Project has been updated").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      
      },

      error:(err:any)=>
      {

        this.translateService.get("Project was not updated").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }

  

  getProjectID(userID:number){
    this.projectdasboardService.getProject(userID).subscribe({
      next:(result:Project)=>
        {
            console.log(result);
            this.project=result;
            this.project.startDate=(this.project.startDate as string).split('T')[0];
            this.project.endDate=(this.project.endDate as string).split('T')[0];
        },

        error:(err:any)=>
        {
            console.log(err);
        }
    })
  }

  // minDate(): string {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = (today.getMonth() + 1).toString().padStart(2, '0'); // +1 jer meseci idu od 0 do 11
  //   const day = today.getDate().toString().padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }


}