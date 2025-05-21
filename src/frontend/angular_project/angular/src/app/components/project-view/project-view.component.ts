import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Task } from '../../models/Task';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { Project } from '../../models/project';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { AssignmentList } from '../../models/AssigmentList';
import { ProjectCommunicationServiceService } from '../../services/project-communication-service.service';
import { TaskListCommunicationService } from '../../services/task-list-communication.service';
import { Subscription } from 'rxjs';
import { TaskListAllTasksCommunicationService } from '../../services/task-list-all-tasks-communication.service';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment.service';
import { ToastrService } from 'ngx-toastr';
import { TaskListSubprojectCommunicationService } from '../../services/task-list-subproject-communication.service';
import { Task_List_Communication_String } from '../../services/Task_List_Communication_String';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss'
})

export class ProjectViewComponent implements OnInit{
  @ViewChild('bolt') bolt: ElementRef | undefined;
  @ViewChild('miniTask') miniTask: ElementRef | undefined;
  @ViewChild('descriptionParagraph') descriptionParagraph: ElementRef | undefined;
  data: any;
  options: any;
  Task:Task[]=[];
  TaskList:any []=[
    {
        assignmentListName: "",
        assignmentListID: 0,
        projectID: 0,
        projectName: "",
        assignmentID: 0,
        assignmentLeadURL: "",
        assignmentLeadFirstName: "",
        assignmentLeadLastName: "Jolovic",
        assignmentName: "",
        description: "",
        status: "",
        priority: "",
        creationDate: "",
        deadline: ""
      }
  ];
  tempTask!:Task;
  openOverlay: boolean = false;
  openDismissOverlay: boolean = false;
  projects!:Project[];
  countries!: any[] ;
  assignmentList!:AssignmentList[];
  AssignmentListID!:AssignmentList[];
  selectedCountry!: string;
  UserCount!: string;
  ActiveTaskCount!: string;
  CopletedTaskCount!: string;  
  project!:Project;
  showList: boolean = false;
  ProjectName!: string;
  stringSubscription: Subscription | undefined;
  stringSubcription2: Subscription | undefined;
  IdSubscription: Subscription | undefined;
  IdSub: Subscription | undefined;
  receivedString: string | undefined;
  isReportOpen: boolean = true;
  UpdateOverlay: boolean=false;
  taskWithComments: Task={
    assignmentID: 0,
    assignmentName: '',
    description: '',
    status: '',
    priority: '',
    assignmentListID: 0,
    assignmentListName: '',
    parentAssignmentID: 0,
    assignmentLeadURL: '',
    assignmentLeadFirstName: '',
    assignmentLeadLastName: '',
    assignedUsers: []
  };
  AllTassks: boolean = true;
  Id!:number;
  parseid!: number;
  TaskCount!: string;
  sendingComment: Comment = {
    commentText: '',
    creationDate: '',
    userID: 0,
    assignmentID: 0
  };
  selectedOption!: string;
  SubProjectId!: number;
  TaskNameFilter: string = '';
  selectedTask!:Task;
  selectedID!: number;
  newTaskGroup: boolean = false;
  inputNewTaskGroup: string = "";
  isAuthorized: boolean = true;
  SingleTask!: Task;
  type!:string;
  SubProjectName:string='All SubProjects'; 
  tempAllTasks: boolean = false;
  tempTaskWithNotifiactionsId: number = 0;
  ProjectInfo!: Project | null;
  statuses!: any[];
  priorityes!:any[];
  showFullDescription: boolean = false;
  showReadMoreButton: boolean = false;
  maxCharacterLimit = 65;
  taskLeads: any[] = [];
  filteredLeads: any[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private TaskListStringCommunication: Task_List_Communication_String,private taskListSubprojectCommunicationService: TaskListSubprojectCommunicationService,
    private toastr: ToastrService, private taskListAllTasksCommunicationService:TaskListAllTasksCommunicationService,
    private taskListComunicationService: TaskListCommunicationService,private projectCommunicationService: ProjectCommunicationServiceService,
    private projectService: ProjectService,private projectdasboardService:ProjectdashboardService, private commentService:CommentService, private router : Router, 
    private renderer: Renderer2,private translateService:TranslateService,
    private cdr: ChangeDetectorRef,private primeNGConfig:PrimeNGConfig) {}
 
    parseDate(dateString: string): Date | null {
      const [month, day, year] = dateString.split('/').map(Number);
      if (!month || !day || !year) {
        return null; 
      }
      return new Date(year, month - 1, day);
    }
 
    get filteredTasks() {
      const filterWords = this.TaskNameFilter ? this.TaskNameFilter.toLowerCase().split(' ') : [];
    
      return this.Task.filter(task => {
        const assignmentName = task.assignmentName.toLowerCase();
        const assigneeFullName = (task.assignmentLeadFirstName + ' ' + task.assignmentLeadLastName).toLowerCase();
        const taskStatus = task.status.toLowerCase();
        const taskPriority = task.priority.toLowerCase();
      
        const taskStartDate = typeof task.creationDate === 'string' ? this.parseDate(task.creationDate) : task.creationDate;
        const taskEndDate = typeof task.deadline === 'string' ? this.parseDate(task.deadline) : task.deadline;
        
      
        if (!taskStartDate || !taskEndDate) {
          return false;
        }
    
        const matchesAssignmentName = filterWords.every(word => assignmentName.includes(word));
        const matchesAssigneeName = filterWords.every(word => assigneeFullName.includes(word));
        const matchesStatus = filterWords.every(word => taskStatus.includes(word));
        const matchesPriority=filterWords.every(word=>taskPriority.includes(word))
        const matchesStartDate = this.dateMatchesFilter(taskStartDate, filterWords);
        const matchesEndDate = this.dateMatchesFilter(taskEndDate, filterWords);

        const matchesLeaderID = this.filteredLeads.length === 0 || this.filteredLeads.includes(task.assignmentLeadID);
      
        return (matchesAssignmentName || matchesAssigneeName || matchesStatus || matchesStartDate || matchesEndDate || matchesPriority) && matchesLeaderID;
      });
    }

     dateMatchesFilter(date: Date, filterWords: string[]): boolean {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();
  
    const dateString = `${month}/${day}/${year}`;
    const dateStringFullYear = `${month}/${day}/${year.substr(2)}`;
    const dateStringShort = `${date.getMonth() + 1}/${date.getDate()}/${year}`;
  
    return filterWords.every(word => 
      dateString.includes(word) || 
      dateStringFullYear.includes(word) || 
      dateStringShort.includes(word)
    );
  }
  role!:string;
  userImg!:string;
  userId!:number;
  noClose!:boolean;
  checkTaskGroup!:boolean;
  selectedLanguage : string = "en";
  selectedProject : number = 0;
  SelctedHandler: boolean = false;
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.translateService.get([
      'Match Any', 'Match All', 'Starts with', 'Contains', 'Not contains', 'Ends with', 'Equals', 'Not equals', 
      'Clear', 'Apply', 'Add Rule', 'Remove Rule', 'Date is', 'Date is not', 'Date is before', 'Date is after'
    ]).subscribe((translations: any) => {
      this.primeNGConfig.setTranslation({
        startsWith: translations['Starts with'],
        contains: translations['Contains'],
        notContains: translations['Not contains'],
        endsWith: translations['Ends with'],
        equals: translations['Equals'],
        notEquals: translations['Not equals'],
        matchAny: translations['Match Any'],
        matchAll: translations['Match All'],
        clear: translations['Clear'],
        apply: translations['Apply'],
        addRule: translations['Add Rule'],
        removeRule: translations['Remove Rule'],
        dateIs: translations['Date is'],
        dateIsNot: translations['Date is not'],
        dateBefore: translations['Date is before'],
        dateAfter: translations['Date is after']
      });
    });
    if (typeof localStorage !== 'undefined') {
        const isDarkMode = localStorage.getItem('darkMode');
        if (isDarkMode) {
          document.querySelector('#project-view-html')?.classList.toggle('dark', JSON.parse(isDarkMode));
        }
      }

    this.role=localStorage.getItem('userRoleName') as string;
    this.userImg=localStorage.getItem('pictureUrl') as string;
    this.userId=Number(localStorage.getItem('id'));
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    this.stringSubscription = this.projectCommunicationService.string$.subscribe((str: string) => {
        this.receivedString = str;
        this.NameLoad(this.receivedString); 
      });
    this.stringSubcription2= this.TaskListStringCommunication.string$.subscribe(({ str, str2 })=>{
      this.SubProjectName=str.replace( '-',' ');
      this.ProjectName=str2.replace( '-',' ');
      // console.log("Ime subProjekta: ", this.SubProjectName)
    })
    this.IdSubscription= this.taskListComunicationService.number$.subscribe((Id) =>
    {
        console.log("Primila se subskriptica za TaskList communication Service")
        this.tempAllTasks=false;
        this.checkTaskGroup=false;
        this.isReportOpen = true;
        this.Id=Id;
        // this.getActiveTaskCount(Id);
        // this.getCompletedTaskCount(Id);
        // this.getUserCount();
        this.getAssignmentsByProjectId(Id);
        this.getAssignmentListByProjectId(Id);
        this.getProjectById(Id);
        // this.getTaskCount();
        // console.log("Tasks from all Projects ",this.Task)

    });
    this.IdSub= this.taskListSubprojectCommunicationService.number$.subscribe((Id)=>
    {
        this.checkTaskGroup=true;
        this.SubProjectId=Id;
        this.isReportOpen = true;
        this.getAssignmentsByAssignmentListId(Id);
        
        // console.log("subproject ", this.Task)
    });
    this.taskListAllTasksCommunicationService.signal$.subscribe(() => {
        this.getTasks();
        // this.getTaskCount();
        //console.log("projects")
        this.tempAllTasks=true;
        this.checkTaskGroup=false;
        this.isReportOpen = true;
        console.log("Called for AllTaskComunication Signal activated");
        console.log(this.Task);
    });
    this.data = {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [300, 50, 100],
                backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--green-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--green-400')]
            }
        ]
    };

    this.countries = [
        { name: 'Monthly', code: 'AU' },
        { name: 'Weekyl', code: 'BR' },
        { name: 'Hourly', code: 'CN' },
        { name: 'Quantyl', code: 'EG' }
    ];

    this.options = {
        cutout: '60%',
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        }
    };
    
    this.getProjects();
    //this.getTasks(); // Promena 20.maj 17:26 marija, ovo ovde ne znam dal nam je potrebno
    
    const potentialProjectID = parseInt(this.router.url.split('/')[2], 10);
    if (!isNaN(potentialProjectID))
      {
        this.getProjectById(potentialProjectID);
      }
    this.getActiveTaskCount();
    this.getCompletedTaskCount();
    this.getUserCount(true);
    //this.getAssignementList();
    this.NameLoad("Tasks from all Projects");
    // this.getTaskCount();
    this.getTaskList();

    this.statuses = [
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Planned', value: 'Planned' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Dismissed', value: 'Dismissed' },
    ];
    this.priorityes=[

      { label: 'High', value: 'High' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Low', value: 'Low' }

    ]
  }
  onProjectChange(event : Event): void {
    const projectID = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedProject = projectID;
    
    if (projectID == 0) 
    {
      this.getTasks();
      this.getProjectById(1);
      this.SelctedHandler= false;
    }
    else
    {
      this.SelctedHandler = true;
      this.getProjectById(projectID);
      this.getAssignmentsByProjectId(projectID);
    } 
  }

  getSeverity1(priority: string):any{
    switch (priority) {
        case 'High':
           return 'warning';
           //return''

        case 'Low':
            return 'info';
           //return ''

        case 'Medium':
            return 'medium';
           //return ''
    }
}

  getSeverity(status: string):any{
    switch (status) {
        case 'In Progress':
            return 'primary';
           //return''

        case 'Dismissed':
            return 'warning';
           //return ''

        case 'Planned':
            return 'info';
           //return ''

        case 'Completed':
            return 'success';    
          // return ''
    }
}
 
  ngAfterViewInit() {
   
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.bolt && this.miniTask && !(this.UpdateOverlay || this.openDismissOverlay)) {
        if (
          e.target !== this.bolt.nativeElement &&
          e.target !== this.miniTask.nativeElement &&
          !this.miniTask.nativeElement.contains(e.target)
        ) {
          if (!this.noClose)
            this.isReportOpen = true;
        }
      }
    });
  
     
   
  }

  selectFile(){
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.parseCSV(file);
  }
  parseCSV(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result as string;
      const rows = contents.split('\n').map(row => row.split(','));
      let header: string[] | undefined;
      if (rows.length > 0) {
        header = rows.shift();
      }
      const data = rows.map(row => {
        const obj: any = {};
        if (header) {
          //header.forEach((key, index) => obj[key.trim()] = row[index]?.trim());
          header.forEach((key, index) => {
            const trimmedKey = key.trim(); // Trim the key to remove any leading/trailing whitespace
            if (trimmedKey.toLowerCase() !== 'assignmentid' &&  trimmedKey.toLowerCase() !== 'taskid' &&  trimmedKey.toLowerCase() !== 'id') { // Check if the key is not 'UserID' (case-insensitive)
              obj[trimmedKey] = row[index]?.trim();
            }
          });
        }
        return obj;
      });
      this.imporTask(data);
    };
    reader.readAsText(file);
  }
  imporTask(data: Task[]) {
    console.log('Imported Task', data);
    data.forEach(task => {
      
      console.log(task);
      task.projectID=this.Id;
      task.assignmentListID=this.SubProjectId;
      task.assignmentLeadID=this.userId;
      this.projectService.createTask(task,Number(localStorage.getItem("id") !)).subscribe({
        next : response => {

          this.translateService.get("Tasks have been imported").subscribe((translatedMessage: string) => {
            this.toastr.success(translatedMessage, 'Success', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
          console.log('Task added :', response);
        },
        error : error =>{


          this.translateService.get("Tasks was not imported").subscribe((translatedMessage: string) => {
            this.toastr.error(translatedMessage, 'Error', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
          console.error('Error adding Task :', error);
        }
      });

      this.getAssignmentsByProjectId(this.Id);
      this.getAssignmentListByProjectId(this.Id);
      this.getProjectById(this.Id);
    });
    this.ngOnInit();
  }

  
  hasTasks(): boolean {
    return this.filteredTasks.length > 0;
  }



  exportTasks(){
    console.log(this.Task);
    if(this.hasTasks()){


  const plainTasks = this.Task.map(task => ({
    TaskId: task.assignmentID,
    Taskname: task.assignmentName,
    AssigmentLead: task.assignmentLeadFirstName + " " + task.assignmentLeadLastName,
    StartDate : task.assignmentCreationDate,
    EndDate : task.deadline,
    Priority: task.priority,
    Status: task.status,
    Description: task.description.replace(/\n/g, ' ')
  }));

  
  const csvContent = this.generateCSVContent(plainTasks);

      
        const blob = new Blob([csvContent], { type: 'text/csv' });
        

        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.setAttribute('download', 'Tasks.csv');


        document.body.appendChild(downloadLink);
        downloadLink.click();


        document.body.removeChild(downloadLink);

        this.translateService.get("Tasks have been exported").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

      }
    
  } 
  private generateCSVContent(tasks: any[]): string {
    const headers = Object.keys(tasks[0]).join(',');
    const rows = tasks.map(task => Object.values(task).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }
  toggleList(): void {
    this.showList = !this.showList;
  }
 
  async sendTaskWitId(TaskID:number){
    // await this.getUserCount(TaskID);
    await this.getAssigmentByAssigmentId(TaskID);
  
    if (this.SingleTask) {
        if (this.SingleTask.assignmentListID) {
          console.log("Ovo je taj single task assigmentListId ", this.SingleTask.assignmentListID);
         

        // Replacing spaces with hyphens in SubProjectName
      
        // Replacing spaces with hyphens in SingleTask.assignmentName
          console.log("----------------------------------------------");
          console.log("da vidim za projekat name "+this.SingleTask.projectName);
          console.log("da vidim za projekat Id "+this.SingleTask.projectID);
          console.log("----------------------------------------------");
          this.router.navigate([
            '/home',
            this.SingleTask.projectID,
            this.SingleTask.assignmentListID,
            this.SingleTask.projectName?
            this.SingleTask.projectName.replace(/\s+/g, '-')
            :this.ProjectName.replace(/\s+/g, '-'),
            this.SingleTask.assignmentListName
              ? this.SingleTask.assignmentListName.replace(/\s+/g, '-') 
              : this.SubProjectName.replace(/\s+/g, '-'),
            TaskID,
            this.SingleTask.assignmentName.replace(/\s+/g, '-'),
            'taskpage'
          ]);
         
          
        } else {
          console.error("assignmentListID is undefined.");
        }
      } else {
        console.error("SingleTask is undefined.");
      }
   }
 getTaskList(){
 Number(localStorage.getItem('id'))
 this.projectService.getAssigmentsLiByUserId(Number(localStorage.getItem('id'))).subscribe({
    next:(rezultat:Task[])=>
    {
        this.Task=rezultat;
        console.log("task lista : ",this.TaskList)
    },
    error:(err:any)=>
    {
        console.log(err);
    }
 })
}
async getAssigmentByAssigmentId(Id: number) {
    return new Promise<void>((resolve, reject) => {
      this.projectService.getAssignmentWithComments(Id).subscribe({
        next: (rezulatat: Task) => {
          this.SingleTask = rezulatat;
          console.log("Single Task id "+this.SingleTask.projectID)
          resolve(); // Rešavamo promis nakon što se SingleTask popuni
        },
        error: (err: any) => {
          console.log(err);
          reject(err); // Odbacujemo promis ako dođe do greške
        }
      });
    });
  }
 getTasks(){
    
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);
    console.log('Calling getTasks() for id = ', this.parseid);
    this.ProjectInfo = null;
    const observable = (localStorage.getItem('userRoleName')=='Employee') ?
      this.projectService.getProjectData(this.parseid) :            // prikazuje sve taskove na kojima je dodeljen
      this.projectService.getProjectDataForManager(this.parseid);   // prikazuje sve taskove na kojima je on project manadzer ili je dodeljen na tasku
    
    observable.subscribe({
        next:(rezultat:Task[])=>
        {
        
            console.log('Result of getTasks() : ', rezultat);
            this.Task=rezultat;
            this.Task.forEach((task) => (task.creationDate = new Date(<Date>task.creationDate)));
            this.Task.forEach((task) => (task.deadline = new Date(<Date>task.deadline)));

            this.filteredLeads=[];
            this.Task.forEach((task) => {
              // Proverite da li lider već postoji u taskLeads nizu
              const existingLeader = this.taskLeads.find(
                (leader) => leader.taskLeadID === task.assignmentLeadID
              );
            
              // Ako lider ne postoji, dodajte ga u taskLeads niz
              if (!existingLeader) {
                this.taskLeads.push({
                  taskLeadID: task.assignmentLeadID,
                  taskLeadFirstName: task.assignmentLeadFirstName,
                  taskLeadLastName: task.assignmentLeadLastName,
                  taskLeadURL: task.assignmentLeadURL
                });
              }
            });
            this.getTaskCount();
            this.getActiveTaskCount();
            this.getCompletedTaskCount();
            this.getUserCount(true);
        },

        error:(err:any)=>
        {
            console.log(err)
        }

     })
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
                this.Task=rezultat;
                this.Task.forEach((task) => (task.creationDate = new Date(<Date>task.creationDate)));
                this.Task.forEach((task) => (task.deadline = new Date(<Date>task.deadline)));

                this.filteredLeads=[];
                this.Task.forEach((task) => {
                  // Proverite da li lider već postoji u taskLeads nizu
                  const existingLeader = this.taskLeads.find(
                    (leader) => leader.taskLeadID === task.assignmentLeadID
                  );
                
                  // Ako lider ne postoji, dodajte ga u taskLeads niz
                  if (!existingLeader) {
                    this.taskLeads.push({
                      taskLeadID: task.assignmentLeadID,
                      taskLeadFirstName: task.assignmentLeadFirstName,
                      taskLeadLastName: task.assignmentLeadLastName,
                      taskLeadURL: task.assignmentLeadURL
                    });
                  }
                });
                
            },
            error:(err:any)=>
            {
                console.log(err)
            }

        })
    }
    getTaskCount()
    {
      this.TaskCount = this.Task.length.toString();
      // this.parseid=parseInt(localStorage.getItem('id') as string, 10);
      //   this.projectService.getTaskCount(this.parseid).subscribe({
      //       next:(count:string)=>
      //       {
      //           this.TaskCount=count;
      //           console.log(this.TaskCount);
      //       },
      //       error:(err:any)=>
      //       {
      //           console.log(err)
      //       }
      //   })
    }
    async getUserCount(withoutCall: boolean , Id? :number)
    {
      if (withoutCall){
      const uniqueLeaderIds = [...new Set(this.Task.map(task => task.assignmentLeadID))];
  
      // Count the number of unique team leaders
      const uniqueLeadersCount = uniqueLeaderIds.length;
    
      this.UserCount = uniqueLeadersCount.toString() + '+';
      }
      else {
      this.projectService.getUserCount(Id!).subscribe({
          next:(count:string)=>
          {
              this.UserCount=count;
          },
          error:(err:any)=>
          {
              console.log(err)
          }
      })
      }
    }

    getActiveTaskCount()
    {
      const plannedTasks = this.Task.filter(task => task.status == 'In Progress');
  
      // Get the count of filtered tasks
      this.ActiveTaskCount = plannedTasks.length.toString();
        // this.projectService.getActiveTaskCount(Id).subscribe({
        //     next:(count:string)=>
        //     {
        //         this.ActiveTaskCount=count;
        //     },
        //     error:(err:any)=>
        //     {
        //         console.log(err)
        //     }
        // })
    }
    
    getCompletedTaskCount()
    {
      const compl = this.Task.filter(task => task.status == 'Completed');
  
      // Get the count of filtered tasks
      this.CopletedTaskCount = compl.length.toString();
        // this.projectService.getCompletedTaskCount(Id).subscribe({
        //     next:(count:string)=>
        //     {
        //         this.CopletedTaskCount=count;
        //     },
        //     error:(err:any)=>
        //     {
        //         console.log(err)
        //     }
        // })
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
    getProjectById(Id:number){
      this.projectdasboardService.getProjectWithLeaderInformation(Id).subscribe({
        next:(rezultat:Project)=>
        {
          this.ProjectInfo=rezultat;
           this.checkDescriptionLength();
          console.log("Project info : ",this.ProjectInfo);
        },
        error:(err:any)=>{
          console.log(err);
        }
      })
    }
       
    getAssignementListByProject(Id: number)
    {
        this.projectService.getAssignmentById(Id).subscribe({
            next:(rezulatat:AssignmentList[])=>
            {
              
                this.AssignmentListID=rezulatat;
                console.log(this.AssignmentListID);
            },
    
            error:(err:any)=>
            {
                console.log(err)
            }
    
         })
    }
    getAssignmentsByProjectId(Id: number)
    {
        this.parseid=parseInt(localStorage.getItem('id') as string, 10);

        const observable = (localStorage.getItem('userRoleName')=='Employee')? //|| this.ProjectInfo.projectLeaderID != this.parseid) ? // ako je zaposleni ili mu je dodeljen task na projektu samo
                          this.projectService.getAssignmentsByProjectId(Id, this.parseid):
                          this.projectService.getAssignmentsByProjectIdForManagerMarija(Id, this.parseid);
        

        observable.subscribe({
            next:(rezulatat:Task[])=>
            {
                console.log("Rezultat taskova po projektu id ", rezulatat);
                this.Task=rezulatat
                this.Task.forEach((task) => (task.creationDate = new Date(<Date>task.creationDate)));
                this.Task.forEach((task) => (task.deadline = new Date(<Date>task.deadline)));

                this.filteredLeads=[];
                this.Task.forEach((task) => {
                  // Proverite da li lider već postoji u taskLeads nizu
                  const existingLeader = this.taskLeads.find(
                    (leader) => leader.taskLeadID === task.assignmentLeadID
                  );
                
                  // Ako lider ne postoji, dodajte ga u taskLeads niz
                  if (!existingLeader) {
                    this.taskLeads.push({
                      taskLeadID: task.assignmentLeadID,
                      taskLeadFirstName: task.assignmentLeadFirstName,
                      taskLeadLastName: task.assignmentLeadLastName,
                      taskLeadURL: task.assignmentLeadURL
                    });
                  }
                });
                this.getTaskCount();
                this.getActiveTaskCount();
                this.getCompletedTaskCount();
                this.getUserCount(false, Id);
            },
    
            error:(err:any)=>
            {
                console.log(err)
            }
    
         })
    }
    // getAssignementList()
    // {
    //     this.projectService.getAssignmentList().subscribe({
    //         next:(rezulatat:AssignmentList[])=>
    //         {
              
    //             this.assignmentList=rezulatat;
    //             console.log(this.assignmentList);
    //         },
    
    //         error:(err:any)=>
    //         {
    //             console.log(err)
    //         }
    
    //      })
    // }
    getAssignmentWithComments(Id: number){
        this.projectService.getAssignmentWithComments(Id).subscribe({
            next:(rezulatat:Task)=>
            {
                this.SingleTask = rezulatat;
                this.taskWithComments=rezulatat;
                this.selectedOption = this.taskWithComments.status;
                this.selectedID=this.taskWithComments.assignmentListID;
                console.log("sleektovan id",this.taskWithComments.assignmentListID);
                console.log("taskWithComments",this.taskWithComments);
                console.log("Asignee profile test",this.taskWithComments.assignedUsers);
                if (this.taskWithComments.assignmentLeaderUsername==localStorage.getItem('username') || this.role=="Manager"){
                    this.isAuthorized=true;
                }
                else{
                    this.isAuthorized=false;
                }
            },
    
            error:(err:any)=>
            {
                console.log(err)
            }
    
         })
    }
  openAddTaskOverlay() {
    console.log("add task overlay");
    if (this.tempAllTasks)
      this.getTasks();
    else if (this.checkTaskGroup)
      this.getAssignmentsByAssignmentListId(this.SubProjectId);
    else
      this.getAssignmentsByProjectId(this.Id);
    this.openOverlay = !this.openOverlay;
  }
  openUpdateTaskOverlay()
  {
    this.getAssignmentWithComments(this.tempTaskWithNotifiactionsId);
    if (this.tempAllTasks)
      this.getTasks();
    else if (this.checkTaskGroup)
      this.getAssignmentsByAssignmentListId(this.SubProjectId);
    else
      this.getAssignmentsByProjectId(this.Id);
    this.UpdateOverlay=!this.UpdateOverlay;
    this.delay();
  }
  openUpdateTaskOverlay1(task:Task)
  {
    this.selectedTask=task;
    this.UpdateOverlay=!this.UpdateOverlay;
  }
  openUpdateTaskOverlay2()
  {
    this.openUpdateTaskOverlay1(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!);
  }

  sendTask(task:Task, type: string) {
    this.tempTask=task;
    this.type=type;
    this.openDismissOverlay = !this.openDismissOverlay;
  }

  sendTask2(type:string) {
    this.sendTask(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!,type);
  }
  
  toggleDismissOverlay() {
    this.getAssignmentWithComments(this.tempTaskWithNotifiactionsId);
    this.openDismissOverlay = !this.openDismissOverlay;
    this.delay();
  }
  NameLoad(Name: string):void{
    this.ProjectName=Name;
  }
  TasksLoad(Id : number): void{
    this.Id=Id;
  }
  sendTaskWithNotifications(id:number,projId:number){
    console.log("AJDI",id);
    this.Id=projId;
    this.tempTaskWithNotifiactionsId=id;
    this.getAssignmentWithComments(id);
    this.isReportOpen=false;
  }
  createNewComment(){
    if (this.sendingComment.commentText){
        this.sendingComment.assignmentID=this.taskWithComments.assignmentID;
        this.sendingComment.creationDate=new Date();
        this.sendingComment.userID=Number(localStorage.getItem('id'));
        console.log("novi komentar",this.sendingComment);
        this.commentService.createNewComment(this.sendingComment).subscribe({
            next:(rezulatat:Comment)=>
            {
                console.log("sent comment",rezulatat);
                if(rezulatat.commentID){
                  this.taskWithComments.comments?.push({
                    commentID: rezulatat.commentID,
                    username: '',
                    userPictureURL: this.userImg,
                    commentText: this.sendingComment.commentText,
                    userID:rezulatat.userID
                  });
                }
                
                this.sendingComment.commentText='';
            },

            error:(err:any)=>
            {
                console.log(err)
            }
        })
    }
   }

   changeTaskWithCommentsStatus(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement?.value || '';
    console.log('Selected value:', selectedValue);
    if (selectedValue=="Dismissed"){
        this.sendTask(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!,"Dismiss");
    }
    else if (selectedValue=="Completed"){
        this.sendTask(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!,"Resolve");
    }
    else{
        console.log('Real task:',this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID));
        this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!.status=selectedValue;
        this.projectService.changeTask(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!,Number(localStorage.getItem("id") !)).subscribe({
            next:(result:any)=>
              {
                    console.log(result);
                    this.translateService.get("Changed task status").subscribe((translatedMessage: string) => {
                      this.toastr.success(translatedMessage, 'Success', {
                        positionClass: 'toast-top-right',
                        timeOut: 1500
                      });
                    });
              },
      
              error:(err:any)=>
              {
                  console.log(err);
                  this.translateService.get("Status change failed").subscribe((translatedMessage: string) => {
                    this.toastr.error(translatedMessage, 'Error', {
                      positionClass: 'toast-top-right',
                      timeOut: 1500
                    });
                  });
              }
          })
    }
    
  }

  changeTaskWithCommentsTaskGroup(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        const selectedValue = selectElement?.value || '';
        console.log('Selected value:', selectedValue);

        if(selectedValue=="new"){
            console.log("ALOOOOOOOO");
            this.newTaskGroup=!this.newTaskGroup;
            return;
        }

        console.log('Real task:',this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID));
        this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!.assignmentListID=Number(selectedValue);
        this.projectService.changeTask(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!,Number(localStorage.getItem("id") !)).subscribe({
        next:(result:any)=>
        {
            console.log(result);
            this.translateService.get("Changed task group").subscribe((translatedMessage: string) => {
              this.toastr.success(translatedMessage, 'Success', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });

        },
      
        error:(err:any)=>
        {
            console.log(err);

            this.translateService.get("Task group change failed").subscribe((translatedMessage: string) => {
              this.toastr.error(translatedMessage, 'Error', {
                positionClass: 'toast-top-right',
                timeOut: 1500
              });
            });
            this.selectedID=this.taskWithComments.assignmentListID;
        }
        })
  }

  // resolveTask(){
  //   this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!.status="Completed";
  //   this.projectService.changeTask(this.Task.find(task => task.assignmentID === this.taskWithComments.assignmentID)!).subscribe({
  //       next:(result:any)=>
  //       {
  //           console.log(result);
  //              this.translateService.get("Task has been resolved").subscribe((translatedMessage: string) => {
   //               this.toastr.success(translatedMessage, 'Success', {
   //                 positionClass: 'toast-top-right',
   //                 timeOut: 1500
   //               });
   //             });
  //          
  //       },
      
  //       error:(err:any)=>
  //       {
  //           console.log(err);
 //         this.translateService.get("Task hasn't been resolved").subscribe((translatedMessage: string) => {
  //         this.toastr.error(translatedMessage, 'Error', {
   //           positionClass: 'toast-top-right',
   //             timeOut: 1500
  //            });
   //         });
  //           
  //       }
  //       })
  // }

  getAssignmentListByProjectId(Id: number)
    {
        this.projectService.getAssignmentListByProjectId(Id).subscribe({
            next:(result:AssignmentList[])=>
            {
              
                this.assignmentList=result;
                console.log("AssignmentListBySelectedProject",this.assignmentList);
            },
    
            error:(err:any)=>
            {
                console.log(err)
            }
    
         })
  }

  createAssignmentList(){
    this.selectedID=this.taskWithComments.assignmentListID;
    const newTaskGroup:AssignmentList={
        assignmentListID: 0,
        assignmentListName: this.inputNewTaskGroup,
        description: '',
        creationDate: new Date(),
        projectID: this.Id
    }
    
    this.projectService.createAssignmentList(newTaskGroup).subscribe({
        next:(res:any)=>{
            this.inputNewTaskGroup='';
            this.newTaskGroup=!this.newTaskGroup;
            //umesto ovoga bi mozda bilo bolje .push(res) ali ne vraca assignment list
            this.getAssignmentListByProjectId(this.Id);

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

  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }

  importTasks(data: any[]) {
    console.log('Imported tasks:', data);
   
    data.forEach(task => {
      
      console.log(task);
    
      this.projectService.createTask(task,Number(localStorage.getItem("id") !)).subscribe({
        next : response => {
          console.log('Task added :', response);
        },
        error : error =>{
          console.error('Error adding task :', error);
        }
      });

      
    });
    this.ngOnInit();
  }

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  checkDescriptionLength() {
    console.log("uslo u checked descp 1");
    if(this.ProjectInfo){
      console.log("uslo u checked descp 2");
      if (this.ProjectInfo.description.length > this.maxCharacterLimit) {
        this.showReadMoreButton = true;
        console.log("uslo u checked descp 3");
      } else {
        this.showReadMoreButton = false;
      }
    }
    else {
      console.log("Project info inside checked descp:",this.ProjectInfo);
    }
   
  }
  delay(){
    //kada se zatvori neki overlay da ne nestane mini task
    this.noClose = true;
    setTimeout(() => { this.noClose = false; }, 500);
  }
  
  message(){
    let tempMessage = "";
    if (this.taskWithComments.assignedUsers.length-3 > 0) {
      const remainingUsers = this.taskWithComments.assignedUsers.slice(3);
      tempMessage = remainingUsers.map(user => `${user.firstName} ${user.lastName}`).join('\n');
    } else {
      tempMessage = '';
    }
    return tempMessage;
  }

  filter2(event:Event){
    if (Array.isArray(event)) {
      this.filteredLeads = event.map(item => item.taskLeadID);
      console.log(this.filteredLeads);
    } 
   }

}
