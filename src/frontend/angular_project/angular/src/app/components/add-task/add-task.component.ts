import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AssignmentList } from '../../models/AssigmentList';
import { Project } from '../../models/project';
import { Task } from '../../models/Task';
import { ProjectService } from '../../services/project.service';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
//import { ProjectViewComponent } from '../project-view/project-view.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent {
  parseid!: number;
  projects!:Project[];
  asssigmentList!:AssignmentList[];
  isAuthorized: boolean = true;
  newTaskGroup: boolean = false;
  inputNewTaskGroup: string = "";
  userIDs: number[] = [];
  taskLeadID: number[] = [-1];
  trashCan: boolean = false;
  tasks: Task[] = [];
  @Output() closeOverlayEvent = new EventEmitter<void>();
  @Input() allTasks!: boolean;
  @Input() projectId!: number;
  @Input() status!: string;
  selectedLanguage : string = "en";
  //constructor(private projectService: ProjectService,private projectdasboardService:ProjectdashboardService,private reloadTaskview: ProjectViewComponent, private toastr: ToastrService){}
  constructor(private projectService: ProjectService,private projectdasboardService:ProjectdashboardService, private toastr: ToastrService,private translateService:TranslateService){}
  ngOnInit(): void {
    console.log("all projects check",this.allTasks);
    this.creationDate=this.minDate();
    if (this.allTasks)
      this.projectId=-1;
    this.getProjects();
    //this.getAssignementList();
    this.getAssignmentListByProjectId(this.projectId);
    this.getAssignmentsByProjectIdForManager(this.projectId);
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }
  task: any = {
  assignmentName: "",
  assignmentLeadID: 0, //promeni id u pravi id 
  description: "",
  status: "",
  priority: "",
  creationDate: this.minDate(),
  deadline: this.minDate(),
  assignmentListID: 0,
  parentAssignmentID: 0,
  dismissed: 0
  };
  creationDate: string='';
  endDate: string='';
  getProjects(){
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);
    this.projectdasboardService.getAssignmentById(this.parseid).subscribe({
       next:(rezulatat:Project[])=>
       {
           
           this.projects=rezulatat
           this.projects.forEach((project) => (project.startDate = new Date(<Date>project.startDate)));
           this.projects.forEach((project) => (project.endDate = new Date(<Date>project.endDate)));
           
           this.setCreationEndDate(this.projectId);
       },

       error:(err:any)=>
       {
           console.log(err)
       }

    })
   }
  //  getAssignementList()
  //   {
  //       this.projectService.getAssignmentList().subscribe({
  //           next:(rezulatat:AssignmentList[])=>
  //           {
              
  //               this.asssigmentList=rezulatat;
  //               console.log(this.asssigmentList);
  //           },
    
  //           error:(err:any)=>
  //           {
  //               console.log(err)
  //           }
    
  //        })
  //   }
  userIDsHandler(array: any){
    this.userIDs=array;
  }

  createTask(){
    // console.log("IDs",this.userIDs);
    // console.log("task lead id",this.taskLeadID);
    this.task.employeeIds = this.userIDs;
    if (this.taskLeadID[0]==-1){
      this.task.assignmentLeadID=Number(localStorage.getItem('id'));
    }
    else
    {
      this.task.assignmentLeadID = this.taskLeadID[0];
    }
    if (this.status){
      this.task.status=this.status;
    }
    console.log(this.task);
    this.projectService.createTask(this.task, Number(localStorage.getItem("id") !)).subscribe({
    
        next:()=>{  
          this.closeOverlay()
          //this.reloadTaskview.ngOnInit()
          console.log(this.task)
          this.translateService.get("Task has been added").subscribe((translatedMessage: string) => {
            this.toastr.success(translatedMessage, 'Success', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
       },
      error:(err:any)=>
      {

        this.translateService.get("Task was not added. Check if you inserted all the data.").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
      
      })
    }
  closeOverlay() {
    this.closeOverlayEvent.emit();
  }
  minDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createAssignmentList(){
    //this.selectedID=this.taskWithComments.assignmentListID;
    const newTaskGroup:AssignmentList={
        assignmentListID: 0,
        assignmentListName: this.inputNewTaskGroup,
        description: '',
        creationDate: new Date(),
        projectID: this.projectId
        
    }
    
    this.projectService.createAssignmentList(newTaskGroup).subscribe({
        next:(res:any)=>{
            this.getAssignmentListByProjectId(this.projectId, this.inputNewTaskGroup);
            this.inputNewTaskGroup='';
            this.newTaskGroup=!this.newTaskGroup;
            //umesto ovoga bi mozda bilo bolje .push(res) ali ne vraca assignment list
            //stavi praviIDALO

            this.translateService.get("Task group has been added").subscribe((translatedMessage: string) => {
              this.toastr.success(translatedMessage, 'Success', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
       },
        error:(err:any)=>
        {
            this.inputNewTaskGroup='';
            this.newTaskGroup=!this.newTaskGroup;
            this.translateService.get("Task group was not added").subscribe((translatedMessage: string) => {
              this.toastr.error(translatedMessage, 'Error', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
        }
    })
  }

  addNewTaskGroup(event: Event) {
    // const selectElement = event.target as HTMLSelectElement;
    // const selectedValue = selectElement?.value || '';
    // console.log('Selected value:', selectedValue);
    this.trashCan=false;
    if(this.task.assignmentListID==-1){
        console.log("ALOOOOOOOO");
        this.newTaskGroup=!this.newTaskGroup;
        this.task.assignmentListID='';
        return;
    }
    this.getAssignmentsByAssignmentListIdAllUsers(this.task.assignmentListID);
  }

  getAssignmentListByProjectId(Id: number, name?: string)
    {
        this.projectService.getAssignmentListByProjectId(Id).subscribe({
            next:(result:AssignmentList[])=>
            {
              
                this.asssigmentList=result;
                console.log("AssignmentListBySelectedProject",this.asssigmentList);
                const option = this.asssigmentList.find(opt => opt.assignmentListName === name);
                //console.log("option",option);
                if (option) {
                  this.task.assignmentListID = option.assignmentListID;
                  this.trashCan=true;
                }
                if(option === undefined)
                  this.task.assignmentListID = '';
            },
    
            error:(err:any)=>
            {
                console.log(err)
            }
    
         })
  }

  getAssignmentsByAssignmentListIdAllUsers(Id: number)
    {
        this.projectService.getAssignmentsByAssignmentListIdAllUsers(Id).subscribe({
            next:(result:Task[])=>
            {
              //console.log("Assignments",result);
              if (!result.length){
                //console.log("display trash can");
                this.trashCan=true;
              }
                
            },
            error:(err:any)=>
            {
                console.log(err)
            }

        })
    }

    deleteAssignment(Id: number)
    {
        this.projectService.deleteAssignment(Id,Number(localStorage.getItem("id") !)).subscribe({
            next:(result:any)=>
            {
              this.trashCan=false;
              this.getAssignmentListByProjectId(this.projectId);
            },
            error:(err:any)=>
            {
                console.log(err)
            }

        })
    }

    getAssignmentsByProjectIdForManager(Id: number)
    {
        this.projectService.getAssignmentsByProjectIdForManager(Id).subscribe({
            next:(result:Task[])=>
            {
                this.tasks=result;
            },
            error:(err:any)=>
            {
                console.log(err)
            }

        })
    }

    formatDate(date: Date): string{
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  
    setCreationEndDate(id: number){
      const tempProject = this.projects.find(project => project.projectID == id);
      //console.log("projekat",tempProject);
      if (tempProject){
        //console.log("proj",this.task.creationDate,this.formatDate(tempProject.startDate as Date));
        if (this.task.creationDate<=this.formatDate(tempProject.startDate as Date)){
          this.task.creationDate=this.formatDate(tempProject.startDate as Date);
          this.task.deadline=this.formatDate(tempProject.startDate as Date);
          this.creationDate=this.task.creationDate;
        }
        else{
          this.task.creationDate=this.minDate();
          this.task.deadline=this.minDate();
          this.creationDate=this.task.creationDate;
        }
        this.endDate=this.formatDate(tempProject.endDate as Date);
      }
    }

    setCreationEndDateParentAssignment(id: number){
      if (id == 0){
        this.task.creationDate=this.minDate();
        this.setCreationEndDate(this.projectId);
        return;
      }
      const tempTask = this.tasks.find(task => task.assignmentID == id);
      //console.log("task",tempTask);
      if (tempTask){
        const tempProject = this.projects.find(project => project.projectID == this.projectId);
        if (tempProject){
          //console.log("asajm",(tempTask.deadline as string).split('T')[0],this.endDate);
          if ((tempTask.deadline as string).split('T')[0]>this.endDate){
            this.setCreationEndDate(this.projectId);
            setTimeout(() => {this.task.parentAssignmentID=0;}, 0);
            this.translateService.get("Depend task end date is after project end").subscribe((translatedMessage: string) => {
              this.toastr.error(translatedMessage, 'Error', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
            return;
          }
          this.task.creationDate=(tempTask.deadline as string).split('T')[0];
          this.task.deadline=(tempTask.deadline as string).split('T')[0];
          this.creationDate=this.task.creationDate;
        }
        // console.log("task",tempTask.deadline);
        // console.log("task", tempTask.deadline as Date)
      }
    }

    changeEndDate(){
      const date = this.task.creationDate;
      this.task.deadline= date;
    }

}
