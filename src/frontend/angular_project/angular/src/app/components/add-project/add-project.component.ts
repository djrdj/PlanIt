import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Project } from '../../models/project';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { ProjectDashboardComponent } from '../project-dashboard/project-dashboard.component';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';
import { AssignmentList } from '../../models/AssigmentList';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.scss'
})
export class AddProjectComponent  implements OnInit{
constructor(private projectService: ProjectService, private toastr: ToastrService,private projectdashboardService:ProjectdashboardService,private reloadDashbaord:ProjectDashboardComponent, private translateService:TranslateService){}
 

  @Output() closeOverlayEvent = new EventEmitter<void>();
  closeOverlay() {
    this.closeOverlayEvent.emit();
  }
  selectedLanguage : string = "en";
  project: any = {
    projectName: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    projectLeaderID:localStorage.getItem('id')
  };
  projects!:Project[];
  taskgroup:AssignmentList={
    assignmentListName: '',
    assignmentListID: 0,
    description: '',
    creationDate: '',
    projectID: 0
  }
  projectID!: number;
  userIDs: number[] = [];

  ngOnInit(): void {
    // this.getProjects();

    const isDarkMode = localStorage.getItem('darkMode');
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);  
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }

  userIDsHandler(array: any){
    this.userIDs=array;
  }

  minDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createProject(project: Project) {
    console.log("emploji id", this.userIDs);
    this.project.employeeIds = this.userIDs;

    this.projectdashboardService.createProject(project, Number(localStorage.getItem("id") !)).subscribe({
      next: () => {
        this.closeOverlay();
        this.reloadDashbaord.ngOnInit();
        console.log(project);


        this.translateService.get("Project has been added").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      },
      error: (err: any) => {


        this.translateService.get("Project was not added").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    });
  }

    // getProjects(){
    //   this.projectService.getProjects().subscribe({
    //      next:(rezulatat:Project[])=>
    //      {
           
    //          this.projects=rezulatat
    //          this.projects.forEach((project) => (project.startDate = new Date(<Date>project.startDate)));
    //          this.projects.forEach((project) => (project.endDate = new Date(<Date>project.endDate)));
    //          console.log(this.projects);
    //      },
 
    //      error:(err:any)=>
    //      {
    //          console.log(err)
    //      }
 
    //   })
    //  }

    //  createAssignmentList(assignmentList:AssignmentList){
    
    //   this.projectService.createAssignmentList(assignmentList).subscribe({
      
    //       next:()=>{  
    //         this.closeOverlay()
    //         this.reloadDashbaord.ngOnInit()
    //         console.log(assignmentList)
    //         this.toastr.success("Task group has been added","Success",{
    //           positionClass: 'toast-top-right',
    //           timeOut: 1500 
    //        });
    //      },
    //     error:(err:any)=>
    //     {
    //       this.toastr.error("Task group was not added","Error",{
    //         positionClass: 'toast-top-right',
    //         timeOut: 1500 
    //       });
    //     }
        
    //     })
    //   }

      create(){
        //console.log('Project ID:', this.projectID);
        // if(this.projectID===undefined){
          this.createProject(this.project);
        // }
        // else{
        //   this.taskgroup.assignmentListName=this.project.projectName;
        //   this.taskgroup.description=this.project.description;
        //   this.taskgroup.creationDate=this.project.startDate;
        //   this.taskgroup.projectID=this.projectID;
        //   this.createAssignmentList(this.taskgroup);
        // }
      }
}
