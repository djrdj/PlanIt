import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../models/Task';
import { ProjectService } from '../../services/project.service';
import { AddColumnDialogComponent } from '../add-column-dialog/add-column-dialog.component';
import { Subscription } from 'rxjs';
import { TaskListCommunicationService } from '../../services/task-list-communication.service';
import { TaskListAllTasksCommunicationService } from '../../services/task-list-all-tasks-communication.service';
import { ToastrService } from 'ngx-toastr';
import { TaskListSubprojectCommunicationService } from '../../services/task-list-subproject-communication.service';
import { transpileModule } from 'typescript';
import { TranslateService } from '@ngx-translate/core';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { Project } from '../../models/project';
@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit {
  showFilters: boolean = false;
  showOverlay: boolean = false;
  showOverlay2: boolean = false;
  showViewButtons: boolean = false;
  selectedLanguage : string = "en";
  highChecked: boolean = true;
  mediumChecked: boolean = true;
  lowChecked: boolean = true;
  isUserManagerOnSelectedProject: boolean = false;

  parseid!:number;
  tasks!: Task[];
  currentItem:any;
  currentTask: Task | null = null;
  role!:string
  columnDeleteButtonVisibility: { [key: string]: boolean } = {};
  IdSubscription : Subscription | undefined;
  IdSub : Subscription | undefined;
  userID: number | undefined;
  
  columns: { name: string, visible: boolean, showDeleteButton: boolean}[] = [
    { name: 'Planned', visible: true , showDeleteButton: false},
    { name: 'In Progress', visible: true , showDeleteButton: false},
    { name: 'Completed', visible: true , showDeleteButton: false},
    { name: 'Dismissed', visible: true, showDeleteButton: false }
  ];
  filteredColumns: { name: string, visible: boolean, showDeleteButton: boolean}[] = [];
  openOverlay: boolean = false;
  projectId: number = 0;
  tempColName: string = '';
  tempAllTasks: boolean = false;
  selectedProject: any;
  selectedProjectManagerId!:number;
  ProjectInfo!:Project;
  projects!: Project[];
  constructor(private taskListComunicationService:TaskListCommunicationService,private projectdasboardService:ProjectdashboardService ,private taskListAllTasksCommunicationService : TaskListAllTasksCommunicationService, private taskListSubprojectCommunicationService: TaskListSubprojectCommunicationService, private projectService:ProjectService, public dialog: MatDialog,private router: Router, private activatedRoute: ActivatedRoute,private toastr:ToastrService,private translateService:TranslateService) {}


  ngOnInit(): void 
  {
    this.selectedProject = 0;
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.role=localStorage.getItem('userRoleName') as string;
    this.userID=Number(localStorage.getItem('id'));
   // this.getProjectData();
    // Fetch columns from the API
    const currentPage = this.getCurrentPageFromUrl(this.router.url);
    console.log("current page: ",currentPage);
    if (Number.isNaN(currentPage)) {
      this.projectService.getKanbanColumnsForUserId(this.userID).subscribe({
        next: (result: any[]) => {
          console.log("Columns from API: ", result);
          
          // this.columns = result.map(column => {
          //   return {
          //     name: column.status,
          //     visible: true,
          //     showDeleteButton: false
          //   };
          // });
  
          // Add predefined columns if they don't exist in the API response
          const predefinedColumns = ['Planned', 'In Progress', 'Completed', 'Dismissed'];
          predefinedColumns.forEach(predefinedColumn => {
            if (!this.columns.find(col => col.name === predefinedColumn)) {
              this.columns.push({ name: predefinedColumn, visible: true, showDeleteButton: false });
            }
          });
  
          console.log("kolone posle forEach ",this.columns);
          // Update filteredColumns based on visibility
          this.updateFilteredColumns();
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    }
    else{
      this.projectService.getKanbanColumnsForUserIdAndProjectId(this.userID,currentPage).subscribe({
        next: (result: any[]) => {
          console.log("Columns from API for user and project: ", result);

          this.columns = result.map(column => {
            return {
              name: column.status,
              visible: true,
              showDeleteButton: false
            };
          });
  
          // Add predefined columns if they don't exist in the API response
          const predefinedColumns = ['Planned', 'In Progress', 'Completed', 'Dismissed'];
          predefinedColumns.forEach(predefinedColumn => {
            if (!this.columns.find(col => col.name === predefinedColumn)) {
              this.columns.push({ name: predefinedColumn, visible: true, showDeleteButton: false });
            }
          });
  
          console.log("kolone posle forEach za projectId: ",this.columns);
          // Update filteredColumns based on visibility
          this.updateFilteredColumns();
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    }

    

    this.IdSubscription= this.taskListComunicationService.number$.subscribe((Id) =>
      {
        this.selectedProject = Id;
        this.getProjectById(Id);
        this.tempAllTasks=false;
        console.log("Subscribed to get  tasks for ", Id);
        const selectedProjectID=Number(Id);
        console.log("Selected project id: ",selectedProjectID);
        this.projectService.getProject(selectedProjectID).subscribe({
          next:(result:any)=>
          {
              this.selectedProjectManagerId=result['projectLeaderID'];
              console.log("Manager id for selected project ",this.selectedProjectManagerId);
              console.log("This user id ",this.userID);
              if(this.selectedProjectManagerId==this.userID){
                this.isUserManagerOnSelectedProject=true;
                console.log("Manager is same as selected from project list");
              }
              else{
                this.isUserManagerOnSelectedProject=false;
                console.log("Manager NOT same as selected from project list");
              }

          },
          error:(err:any)=>
          {
            console.log("Error, ",err);
          }
        });
          this.parseid=Id;
          this.getAssignmentsByProjectId(Id);
        // console.log("All tasks "+this.Task)

      });
    this.IdSub= this.taskListSubprojectCommunicationService.number$.subscribe((Id)=>
    {
      this.tempAllTasks=false;

      // const selectedProjectID=Number(Id);
      // console.log("Selected project id: ",selectedProjectID);
      // this.projectService.getProject(selectedProjectID).subscribe({
      //   next:(result:any)=>
      //   {
      //       this.selectedProjectManagerId=result['projectLeaderID'];
      //       console.log("Manager id for selected project ",this.selectedProjectManagerId);
      //       console.log("This user id ",this.userID);
      //       if(this.selectedProjectManagerId==this.userID){
      //         this.isUserManagerOnSelectedProject=true;
      //         console.log("Manager is same as selected from project list");
      //       }
      //       else{
      //         this.isUserManagerOnSelectedProject=false;
      //         console.log("Manager NOT same as selected from project list");
      //       }

      //   },
      //   error:(err:any)=>
      //   {
      //     console.log("Error, ",err);
      //   }
      // });

      this.getAssignmentsByAssignmentListId(Id);
      console.log(this.tasks);
      console.log("subproject "+this.tasks)
    });
    this.taskListAllTasksCommunicationService.signal$.subscribe(() => {
      this.tempAllTasks=true;
      console.log("Subscribed to get all tasks");
      this.getProjectData();
    });

    // const currentPage = this.getCurrentPageFromUrl(this.router.url);
    console.log(currentPage);
    if (!isNaN(currentPage)) {
      this.getAssignmentsByProjectId(currentPage);
      this.getProjectById(currentPage);
    } else {
      this.getProjectData();
    }

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('.kanban-page');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }

    this.getProjects();
  }
  getProjects(){
    this.projectdasboardService.getProjects().subscribe({
       next:(rezulatat:Project[])=>
       {
         
           this.projects=rezulatat
           this.projects.forEach((project) => (project.startDate = new Date(<Date>project.startDate)));
           this.projects.forEach((project) => (project.endDate = new Date(<Date>project.endDate)));
           console.log(this.projects);
       },

       error:(err:any)=>
       {
           console.log(err)
       }

    })
   }
   onProjectChange(event : Event): void {
    const projectID = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedProject = projectID;
    
    
    this.getProjectById(projectID);
    this.getAssignmentsByProjectId(projectID);
     
  }
  private getCurrentPageFromUrl(url: string) : number{
    const parts = url.split('/');
    const lastPart = parts[parts.length - 5];
    return parseInt(lastPart, 10);
  }
  updateFilteredColumns() {
    this.filteredColumns = this.columns.filter(column => column.visible);
  }
  getProjectById(Id:number){
    this.projectdasboardService.getProjectWithLeaderInformation(Id).subscribe({
      next:(rezultat:Project)=>
      {
        this.ProjectInfo=rezultat;
       
        console.log("Project info : ",this.ProjectInfo);
      },
      error:(err:any)=>{
        console.log(err);
      }
    })
  }
  toggleColumnVisibility(column: { name: string, visible: boolean }) {
    column.visible = !column.visible;
    this.updateFilteredColumns(); 
  }

  showAddColumnPopup() {
    const dialogRef = this.dialog.open(AddColumnDialogComponent, {
      width: '250px',
      data: { columnName: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addColumn(result);
      }
    });
  }

  addColumn(columnName: string) {
    this.columns.push({ name: columnName, visible: true , showDeleteButton: false}); // Dodajemo novu kolonu sa podrazumevanom vidljivošću
    this.updateFilteredColumns(); // Ažuriramo prikaz kolona na tabli kanbana
    const projectID = this.getCurrentPageFromUrl(this.router.url);
    const userID=Number(localStorage.getItem('id'));
    if (!isNaN(projectID)){
      this.projectService.addNewKanbanColumn(userID,projectID,columnName,this.columns.length+1).subscribe({
        next:(result:any)=>
        {
            console.log("Dodata kolona u bazu",result);

            this.translateService.get("Column has been added").subscribe((translatedMessage: string) => {
              this.toastr.success(translatedMessage, 'Success', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
        },
        error:(err:any)=>
        {

          this.translateService.get("Column was not added").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
            console.log(err);
        }
      })
    }
  }


  filterTasks(status: string): any[] {
    if (this.tasks && this.tasks.length>0) {
      return this.tasks.filter(item => {
        if (
            // (!this.highChecked && !this.mediumChecked && !this.lowChecked) ||
            (this.highChecked && item.priority=="High") ||
            (this.mediumChecked && item.priority=="Medium") ||
            (this.lowChecked && item.priority=="Low")
        ) {
            return item.status === status;
        } else {
            return false;
        }
      });
    }
    return [];
  }
  onTaskClicked(task : Task)
  {
    console.log("STA IMA OVDE",task);
    //const projectID = this.getCurrentPageFromUrl(this.router.url);
    // if (!isNaN(projectID)) 
    //   this.router.navigate(['/home', projectID, task.assignmentID, 'taskpage']);
    // else 
    //   this.router.navigate(['/home', '-', task.assignmentID, 'taskpage']);
    console.log('/home', task.projectID, task.assignmentListID, task.projectName, task.assignmentListName, task.assignmentID, task.assignmentName, 'taskpage');
    this.router.navigate(['/home', task.projectID, task.assignmentListID, task.projectName || this.activatedRoute.snapshot.paramMap.get('ProjectName'), task.assignmentListName, task.assignmentID, task.assignmentName, 'taskpage']);
  }

  onDragStart(item:Task){
    this.currentItem = item;
  }

  
  onDrop(event: any, status: string) {
    event.preventDefault();
    if (this.currentItem) {
      const record = this.tasks.find(t => t.assignmentID === this.currentItem.assignmentID);
      if (record) {
        const oldStatus = record.status;
        record.status = status;
        this.changeTask(record);
  
        // if (oldStatus !== status) {
        //   const originalIndex = this.columns.findIndex(col => col.name === oldStatus);
        //   const targetIndex = this.columns.findIndex(col => col.name === status);
        //   if (originalIndex !== -1 && targetIndex !== -1) {
        //     const updatedColumns = [...this.columns];
        //     const movedColumn = updatedColumns.splice(originalIndex, 1)[0];
        //     updatedColumns.splice(targetIndex, 0, movedColumn);
        //     this.columns = updatedColumns;
        //   }
        // }
      }
      this.currentItem = null;
    }
  }
  
  

  onDragOver(event: any){
    event.preventDefault();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    this.showOverlay = !this.showOverlay;
  }


  getIconUrl(item: any): string {
    if (item.priority==="High") {
      return '../../../assets/icons/high_priority.svg';
    } else if (item.priority==="Medium") {
      return '../../../assets/icons/medium_priority.svg';
    } else (item.priority==="Low")
      return '../../../assets/icons/low_priority.svg';
  }

  getProjectData(){

    this.userID=Number(localStorage.getItem('id'));
    this.projectService.getKanbanColumnsForUserId(this.userID).subscribe({
      next: (result: any[]) => {
        console.log("Columns from API: ", result);
        
        this.columns = result.map(column => {
          return {
            name: column.status,
            visible: true,
            showDeleteButton: false
          };
        });

        // Add predefined columns if they don't exist in the API response
        const predefinedColumns = ['Planned', 'In Progress', 'Completed', 'Dismissed'];
        predefinedColumns.forEach(predefinedColumn => {
          if (!this.columns.find(col => col.name === predefinedColumn)) {
            this.columns.push({ name: predefinedColumn, visible: true, showDeleteButton: false });
          }
        });

        console.log("kolone posle forEach ",this.columns);
        // Update filteredColumns based on visibility
        this.updateFilteredColumns();
      },
      error: (err: any) => {
        console.log(err);
      }
    });


    // this.columns=[
    //   { name: 'Planned', visible: true , showDeleteButton: false},
    //   { name: 'In Progress', visible: true , showDeleteButton: false},
    //   { name: 'Completed', visible: true , showDeleteButton: false},
    //   { name: 'Dismissed', visible: true, showDeleteButton: false }
    // ];
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);
    this.projectService.getProjectData(this.parseid).subscribe({
      next: (result: Task[]) => {
          console.log(result);
          this.tasks = result;

          // Izvući jedinstvene vrednosti kolona
          const uniqueColumns = Array.from(new Set(result.map(task => task.status)));
          console.log("unique : ", uniqueColumns);
          // Dodati jedinstvene kolone u niz kolona
          uniqueColumns.forEach(column => {
              if (!this.columns.find(col => col.name === column)) {
                  this.columns.push({ name: column, visible: true , showDeleteButton: false});
                  console.log(this.columns
                  );
                  this.updateFilteredColumns();
              }
          });

          // Ažuriramo prikaz kolona na tabli kanbana
          this.updateFilteredColumns();
      },
      error: (err: any) => {
          console.log(err);
      }
    });

  }

  getAssignmentsByProjectId(Id:number)
  {
    // this.columns=[
    //   { name: 'Planned', visible: true , showDeleteButton: false},
    //   { name: 'In Progress', visible: true , showDeleteButton: false},
    //   { name: 'Completed', visible: true , showDeleteButton: false},
    //   { name: 'Dismissed', visible: true, showDeleteButton: false }
    // ];
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);
    
    this.projectService.getKanbanColumnsForUserIdAndProjectId(this.parseid,Id).subscribe({
      next: (result: any[]) => {
        console.log("Columns from API for user and project: ", result);
          
        this.columns = result.map(column => {
          return {
            name: column.status,
            visible: true,
            showDeleteButton: false
          };
        });

        // Add predefined columns if they don't exist in the API response
        const predefinedColumns = ['Planned', 'In Progress', 'Completed', 'Dismissed'];
        predefinedColumns.forEach(predefinedColumn => {
          if (!this.columns.find(col => col.name === predefinedColumn)) {
            this.columns.push({ name: predefinedColumn, visible: true, showDeleteButton: false });
          }
        });

        console.log("kolone posle forEach za projectId: ",this.columns);
        // Update filteredColumns based on visibility
        this.updateFilteredColumns();
      },
      error: (err: any) => {
        console.log(err);
      }
    })
    
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);

    const observable = (localStorage.getItem('userRoleName')=='Employee')? //|| this.ProjectInfo.projectLeaderID != this.parseid) ? // ako je zaposleni ili mu je dodeljen task na projektu samo
                      this.projectService.getAssignmentsByProjectId(Id, this.parseid):
                      this.projectService.getAssignmentsByProjectIdForManagerMarija(Id, this.parseid);
    

    observable.subscribe({
      next: (result: Task[]) => {
          console.log(result);
          this.tasks = result;

          // Izvući jedinstvene vrednosti kolona
          const uniqueColumns = Array.from(new Set(result.map(task => task.status)));
          console.log("unique : ", uniqueColumns);
          // Dodati jedinstvene kolone u niz kolona
          uniqueColumns.forEach(column => {
              if (!this.columns.find(col => col.name === column)) {
                  this.columns.push({ name: column, visible: true , showDeleteButton: false});
                  console.log(this.columns
                  );
                  this.updateFilteredColumns();
              }
          });

          // Ažuriramo prikaz kolona na tabli kanbana
          this.updateFilteredColumns();
      },
      error: (err: any) => {
          console.log(err);
      }
    });

  }

  changeTask(task:Task){
    this.projectService.changeTaskKanban(task).subscribe({
      next:(result:any)=>
        {
            console.log(result);
        },

        error:(err:any)=>
        {
            console.log(err);
        }
    })
  }

  toggleViewButtons(){
    this.showViewButtons =!this.showViewButtons;
    this.showOverlay2 = !this.showOverlay2;
  }

  deleteColumn(columnName: string) {
    const index = this.columns.findIndex(col => col.name === columnName);
    const projectID = this.getCurrentPageFromUrl(this.router.url);
    const userID=Number(localStorage.getItem('id'));
    if (index !== -1) {
        this.columns.splice(index, 1);
        this.projectService.deleteKanbanColumn(userID,projectID,columnName).subscribe({
          next:(result:any)=>
          {


            this.translateService.get("Column has been deleted").subscribe((translatedMessage: string) => {
              this.toastr.success(translatedMessage, 'Success', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });

              console.log("Obrisana kolona iz baze! ",result);
            
          },
          error:(err:any)=>
          {
            
            this.translateService.get("Column was not deleted").subscribe((translatedMessage: string) => {
              this.toastr.error(translatedMessage, 'Error', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });

              console.log(err);
          }
        });
        this.updateFilteredColumns();
    }
  }

  isColumnEmpty(columnName: string): boolean {
    const predefinedColumns = ['Planned', 'In Progress', 'Completed', 'Dismissed'];
    return !predefinedColumns.includes(columnName) && this.filterTasks(columnName).length === 0;
  }

  toggleDeleteButton(column : {name : string, visible : boolean, showDeleteButton: boolean }) {
    // Toggle the visibility of delete button for the clicked column
    column.showDeleteButton = !column.showDeleteButton;
    // Ensure only the clicked column's delete button is shown
    this.filteredColumns.forEach(col => {
      if (col !== column) {
        col.showDeleteButton = false;
      }
    });
  }

  onColumnDragOver(event: any, columnName: string) {
    event.preventDefault();
  }
  
  onColumnDrop(event: any, columnName: string) {
    event.preventDefault();
    const draggedColumnName = event.dataTransfer.getData('text/plain');
    const draggedColumnIndex = this.columns.findIndex(col => col.name === draggedColumnName);
    const targetColumnIndex = this.columns.findIndex(col => col.name === columnName);
    const targetColumnName=this.columns[targetColumnIndex].name;
    
    if (draggedColumnIndex !== -1 && targetColumnIndex !== -1) {
      // Razmena pozicija kolona
      const draggedColumn = this.columns[draggedColumnIndex];
      this.columns[draggedColumnIndex] = this.columns[targetColumnIndex];
      this.columns[targetColumnIndex] = draggedColumn;
      

      const currentPage = this.getCurrentPageFromUrl(this.router.url);
      if (!isNaN(currentPage)) {
        this.projectService.updateKanbanColumnPosition(this.parseid,currentPage,draggedColumnName,targetColumnIndex).subscribe({
          next:(result:any)=>
          {
            console.log("Kolona 1 zamenjena ",result);
          },
          error:(err:any)=>
          {
            console.log(err);
          }
        });

      this.projectService.updateKanbanColumnPosition(this.parseid,currentPage,targetColumnName,draggedColumnIndex).subscribe({
          next:(result:any)=>
          {
            console.log("Kolona 2 zamenjena ",result);
          },
          error:(err:any)=>
          {
            console.log(err);
          }
        });
      }
      
      
      this.updateFilteredColumns();
    }
  }
  

  onColumnDragStart(event: DragEvent, columnName: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', columnName);
    }  
  }
  
  

  onTaskDragStart(event: DragEvent, task: Task) {
    this.currentTask = task;
    const targetElement = event.target as HTMLElement;
      if (targetElement && targetElement.classList) {
          targetElement.classList.add('dragging');
      }
  
  }

  onTaskDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onTaskDragEnd(event: DragEvent) {
    // Uklonite klasu .dragging kada korisnik završi prevlačenje
    const targetElement = event.target as HTMLElement;
      if (targetElement && targetElement.classList) {
          targetElement.classList.remove('dragging');
      }
  }

  onTaskDrop(event: DragEvent, targetTask: Task) {
    event.preventDefault();
    if (this.currentTask && this.currentTask !== targetTask) {
      const currentIndex = this.tasks.indexOf(this.currentTask);
      const targetIndex = this.tasks.indexOf(targetTask);
      if (currentIndex !== -1 && targetIndex !== -1) {
        // Uklonite trenutni zadatak sa trenutnog indeksa
        this.tasks.splice(currentIndex, 1);
        // Ubacite trenutni zadatak na ciljani indeks
        this.tasks.splice(targetIndex, 0, this.currentTask);
      }
    }
    this.currentTask = null;
  }

  filterTasksCount(columnName: string): number {
    return this.filterTasks(columnName).length;
  }

  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }
  
  openAddTaskOverlay(column?: string) {
    if (column){
      this.tempColName=column;
    }
    this.projectId=this.getCurrentPageFromUrl(this.router.url);
    //this.getAssignmentsByProjectId(this.projectId);
    if (this.activatedRoute.snapshot.paramMap.get('SubProjectID')!="-"){
      this.getAssignmentsByAssignmentListId(Number(this.activatedRoute.snapshot.paramMap.get('SubProjectID')));
    }
    else if (this.activatedRoute.snapshot.paramMap.get('projectID')!='0') {
      this.getAssignmentsByProjectId(Number(this.activatedRoute.snapshot.paramMap.get('projectID')));
    } else {
      this.getProjectData();
    }
    this.openOverlay = !this.openOverlay;
    
  }

  getAssignmentsByAssignmentListId(Id: number)
  {
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);

        const observable = (localStorage.getItem('userRoleName')=='Employee') ?
          this.projectService.getAssignmentsByAssignmentListId(Id,this.parseid) :       
          this.projectService.getAssignmentsByAssignmentListIdAllUsers(Id);   
        
        
      observable.subscribe({
      next:(rezultat:Task[])=>
      {
        this.tasks=rezultat;
        
      },
      error:(err:any)=>
      {
        console.log(err)
      }

    })
  }

}
