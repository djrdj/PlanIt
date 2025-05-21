import { Component, EventEmitter, Output, Input, OnInit, input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/Task';
import { AssignmentList } from '../../models/AssigmentList';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  styleUrl: './update-task.component.scss'
})
export class UpdateTaskComponent implements OnInit {
  @Output() closeOverlayEvent = new EventEmitter<void>();

  closeOverlay() {
    this.closeOverlayEvent.emit();
  }
  @Input() input!: { inputTask: Task; projectId: number };
  task!:Task;
  isAuthorized: boolean = true;
  newTaskGroup: boolean = false;
  inputNewTaskGroup: string = "";
  userIdsToAdd: number[] = [];
  userIdsToRemove: number[] = [];
  
  selectedLanguage : string = "en";
  taskLeadID: number[] = [];
  trashCan: boolean = false;
  tasks: Task[] = [];
  progress: number = 0;
  dateDifference: number = 0;
  openResolveOverlay: boolean = false;
  constructor(private toastr: ToastrService, private projectService: ProjectService,private translateService:TranslateService) { }
  ngOnInit(): void {

    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.task = { ...this.input.inputTask };
    this.task.creationDate = this.formatDate(this.input.inputTask.creationDate as Date);
    this.task.deadline = this.formatDate(this.input.inputTask.deadline as Date);
    this.dateDifference = (this.input.inputTask.deadline as Date).getTime() - (this.input.inputTask.creationDate as Date).getTime();
    // this.getAssignementList();
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.overlay');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
    this.taskLeadID[0]=this.task.assignmentLeadID!;
    if (this.task.assignmentLeadID==Number(localStorage.getItem('id')) || localStorage.getItem('userRoleName')=="Manager"){
      this.isAuthorized=true;
    }
    else{
        this.isAuthorized=false;
    }
    this.getAssignmentListByProjectId(this.input.projectId);
    this.getAssignmentsByProjectIdForManager(this.input.projectId);
  }
  asssigmentList!: AssignmentList[];

  userIdsToAddHandler(array: number[]){
    this.userIdsToAdd=array;
  }

  userIdsToRemoveHandler(array: number[]){
    this.userIdsToRemove=array;
  }

  // getAssignementList() {
  //   this.projectService.getAssignmentList().subscribe({
  //     next: (rezulatat: AssignmentList[]) => {

  //       this.asssigmentList = rezulatat;
  //       console.log(this.asssigmentList);
  //     },

  //     error: (err: any) => {
  //       console.log(err)
  //     }

  //   })
  // }

  // minDate(): string {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = (today.getMonth() + 1).toString().padStart(2, '0');
  //   const day = today.getDate().toString().padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

  changeTask() {
    console.log("useri za dodavanje",this.userIdsToAdd);
    console.log("task lead novi",this.taskLeadID[0]);
    console.log("useri za uklanjanje",this.userIdsToRemove);
    this.task.employeeIdsToAdd=this.userIdsToAdd;
    // if (this.taskLeadID[0]==-1){
    //   this.task.assignmentLeadID=Number(localStorage.getItem('id'));
    // }
    this.task.assignmentLeadID=this.taskLeadID[0];
    this.task.employeeIdsToRemove=this.userIdsToRemove;
    this.projectService.changeTask(this.task,Number(localStorage.getItem("id") !)).subscribe({
      next: (result:any) => {
        this.closeOverlay()
        //this.reloadDashboard.ngOnInit()
        console.log(result)

        this.translateService.get("Task has been updated").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

      },

      error: (err: any) => {
        this.translateService.get("Task was not updated").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    })
  }

  createAssignmentList(){
    //this.selectedID=this.taskWithComments.assignmentListID;
    const newTaskGroup:AssignmentList={
        assignmentListID: 0,
        assignmentListName: this.inputNewTaskGroup,
        description: '',
        creationDate: new Date(),
        projectID: this.input.projectId
        
    }
    
    this.projectService.createAssignmentList(newTaskGroup).subscribe({
        next:(res:any)=>{
            this.getAssignmentListByProjectId(this.input.projectId, this.inputNewTaskGroup);
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
        this.newTaskGroup=!this.newTaskGroup;
        this.task.assignmentListID=this.input.inputTask.assignmentListID;
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
                if (option) {
                  this.task.assignmentListID = option.assignmentListID;
                  this.trashCan=true;
                }
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
              //this.task.assignmentListID=this.input.inputTask.assignmentListID;
              this.trashCan=false;
              this.getAssignmentListByProjectId(this.input.projectId);
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
                this.tasks = this.tasks.filter(task => task.assignmentID !== this.input.inputTask.assignmentID);
                this.tasks = this.tasks.filter(task => task.parentAssignmentID !== this.input.inputTask.assignmentID);
            },
            error:(err:any)=>
            {
                console.log(err)
            }

        })
    }

    validateProgressKeyDown(event: KeyboardEvent) {
      const key = event.key;
      const input = event.target as HTMLInputElement;
      const selectionStart = input.selectionStart!;
      const selectionEnd = input.selectionEnd!;
      const value = input.value;
    
      // Ako postoji selektovan tekst, simuliramo unos tako da obrišemo selektovan tekst i dodamo novi unos
      const newValue = value.substring(0, selectionStart) + key + value.substring(selectionEnd);
      const regex = /^(?:100|[1-9]?[0-9]?)$/; // Regularni izraz za proveru unosa broja od 0 do 100
    
      if (!(event.key === 'Backspace' || regex.test(newValue))) {
          event.preventDefault(); // Zaustavlja unos ako nije valjan broj od 0 do 100
      }
    }

    formatDate(date: Date): string{
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    setCreationEndDateParentAssignment(id: number){
      if (id == 0){
        this.task.creationDate = this.formatDate(this.input.inputTask.creationDate as Date);
        this.task.deadline = this.formatDate(this.input.inputTask.deadline as Date);
        return;
      }
      const tempTask = this.tasks.find(task => task.assignmentID == id);
      //console.log("task",tempTask);
      if (tempTask){
        // console.log("task",tempTask.deadline);
        // console.log("task", tempTask.deadline as Date)
        if(tempTask.deadline!>this.task.creationDate!){
          //console.log("changing");
          //console.log(tempTask.deadline,this.task.creationDate);
          this.task.creationDate=(tempTask.deadline as string).split('T')[0];
          const time=new Date(tempTask.deadline!).getTime()+ this.dateDifference;
          const newDate=new Date(time);
          this.task.deadline=this.formatDate(newDate);
        }
        // else{
        //   console.log("no changes");
        //   console.log(tempTask.deadline,this.task.creationDate);
        // }
      }
    }

    checkProgress(){
      if (this.task.progress==100)
        this.openResolveOverlay=!this.openResolveOverlay;
    }

}
