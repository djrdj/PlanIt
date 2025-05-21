import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GanttBarClickEvent, GanttDate, GanttDateFormat, GanttDateUtil, GanttDragEvent, GanttGroup, GanttItem, GanttLineClickEvent, GanttLinkDragEvent,GanttLinkLineType, GanttLinkType, GanttPrintService, GanttSelectedEvent, GanttUpper, GanttViewType, Locale, NgxGanttComponent} from '@worktile/gantt';
import { Task } from '../../models/Task';
import { ProjectService } from '../../services/project.service';
import { TaskListAllTasksCommunicationService } from '../../services/task-list-all-tasks-communication.service';
import { Subscription } from 'rxjs';
import { TaskListCommunicationService } from '../../services/task-list-communication.service';
import { fr,enUS } from 'date-fns/locale';
import { ToastrService } from 'ngx-toastr';
import { start } from 'repl';
import { TaskListSubprojectCommunicationService } from '../../services/task-list-subproject-communication.service';
import { TranslateService } from '@ngx-translate/core';
import { Project } from '../../models/project';
import { ProjectdashboardService } from '../../services/projectdashboard.service';

@Component({
  selector: 'app-gantic',
  templateUrl: './gantic.component.html',
  styleUrl: './gantic.component.scss',
  providers: [GanttPrintService]
})
export class GanticComponent {
  showFilter: boolean = false;
  showOverlay: boolean = false;
  projects !: Project[];
  Task!: Task[];
  parseid!: number;
  groups: GanttGroup[] = [];
  items: GanttItem[] = [];
  @ViewChild('gantt') ganttComponent!: NgxGanttComponent;
  viewType: GanttViewType = GanttViewType.day;
  // extra atributes
  IdSubscription: Subscription | undefined;
  IdSub: Subscription | undefined;
  SubProjectId!: number;
  selectedView: string = 'day';
  selectedLanguage : string = "en";
  ProjectInfo!: Project;
  viewOptions: GanttViewOptions = {
    dateFormat: {
      year: `yyyy`,
      yearQuarter : `yyyy QQQQ`,
      month: 'LLL',
      day : 'd',
      week: 'w',
      yearMonth: 'yyyy LLL'
    }
  };

  globalConfig: GanttGlobalConfig = {
    dateFormat: {
      day: 'd',
      week: 'w', 
      month: 'M',  
      year: 'yyyy'
    },
    dateOptions: {
      locale: enUS, 
      weekStartsOn: 1
    },
    styleOptions: {
      headerHeight: 50, // 自定义 header 高度
      lineHeight: 30, // 自定义行高
      barHeight: 20 // 自定义 Bar 的高度
    },
    linkOptions: {
      dependencyTypes: [GanttLinkType.fs], // Example dependency types
      showArrow: true, // Example option to show arrows on the links
      lineType: GanttLinkLineType.straight // Specify straight lines
    }
  }

  views = [
    {
        name: 'day',
        value: GanttViewType.day
    },
    {
        name: 'week',
        value: GanttViewType.week
    },
    {
        name: 'month',
        value: GanttViewType.month
    },
    {
        name: 'quarter',
        value: GanttViewType.quarter
    },
    {
        name: 'year',
        value: GanttViewType.year
    }
  ];
  
  projectColors: string[] = [
    "#FF69B4", // Deep Pink
    "#87CEEB", // Sky Blue
    "#FFD700", // Gold
    "#7FFFD4", // Aquamarine
    "#FFA07A", // Light Salmon
    "#20B2AA", // Light Sea Green
    "#BA55D3", // Medium Orchid
    "#FF6347", // Tomato
    "#40E0D0", // Turquoise
    "#9370DB", // Medium Purple
    "#00BFFF", // Deep Sky Blue
    "#00FF7F", // Spring Green
    "#FFC0CB", // Pink
    "#F0E68C", // Khaki
    "#DA70D6", // Orchid
    "#FFA500", // Orange
    "#7FFF00", // Chartreuse
    "#AFEEEE", // Pale Turquoise
    "#DDA0DD", // Plum
    "#66CDAA", // Medium Aquamarine
    "#FFE4E1", // Misty Rose
    "#FA8072", // Salmon
    "#9370DB", // Medium Purple
    "#FFE4B5", // Moccasin
    "#98FB98", // Pale Green
    "#DDA0DD", // Plum
    "#FAFAD2", // Light Goldenrod Yellow
    "#7B68EE", // Medium Slate Blue
    "#FFB6C1", // Light Pink
    "#4682B4", // Steel Blue
  ];

  addTaskOverlay:boolean=false;
  dragging:boolean=false;
  tempId:any;
  columnData:any []=[
    {
      assignees: [],
      status: "",
      priority: ""
    }
  ];
  constructor(private printService: GanttPrintService,private projectdasboardService:ProjectdashboardService ,private taskListAllTasksCommunicationService:TaskListAllTasksCommunicationService, private taskListSubprojectCommunicationService: TaskListSubprojectCommunicationService, private projectService: ProjectService,private taskListComunicationService: TaskListCommunicationService, private router : Router, private toastr: ToastrService, private elRef: ElementRef, private renderer: Renderer2, private activatedRoute: ActivatedRoute,private translateService:TranslateService) {}
  lastClickTime: number = 0;
  projectIDMap = new Map<number, number>();
  tempStartDate= "";
  dateFlag: boolean = true;
  nameChecked: boolean = true;
  assignedChecked: boolean = true;
  progressChecked: boolean = true;
  statusChecked: boolean = true;
  priorityChecked: boolean = true;
  selectedProject : number = 0;
  ngOnInit(): void
  {
    this.getProjects();
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
  
    this.IdSubscription= this.taskListComunicationService.number$.subscribe((Id) =>
      {
        this.getProjectById(Id);
        console.log("Subscribed to get  tasks for ", Id);
          this.parseid=Id;
          this.tempId=this.parseid;
          this.getAssignmentsByProjectId(Id);
         // console.log("All tasks "+this.Task)
  
      });
    this.IdSub= this.taskListSubprojectCommunicationService.number$.subscribe((Id)=>
      {
        this.SubProjectId=Id;
        this.getAssignmentsByAssignmentListId(Id);
        console.log(this.Task);
        console.log("subproject "+this.Task)
      });
    this.taskListAllTasksCommunicationService.signal$.subscribe(() => {
      console.log("Subscribed to get all tasks");
      this.tempId='';
      this.getTasks();
    });

    const savedView = localStorage.getItem('selectedView');
    this.selectedView = savedView ? savedView : 'day';
    this.viewType = this.selectedView as GanttViewType;

    const projectID = Number(this.activatedRoute.snapshot.paramMap.get('projectID'));
    const SubProjectID = Number(this.activatedRoute.snapshot.paramMap.get('SubProjectID'));
    if (SubProjectID)
      this.getAssignmentsByAssignmentListId(SubProjectID);
    else if (projectID) {
      this.getAssignmentsByProjectId(projectID);
      this.getProjectById(projectID);
    } else {
      this.getTasks();
    }
    //console.log("Tasks it got in NGONIT",this.Task);

    // Set the column name as a string with Chinese month names
    this.viewOptions.columnName = '一月, 二月, 三月, 四月, 五月, 六月, 七月, 八月, 九月, 十月, 十一月, 十二月';

    // Define a mapping between Chinese month names and English month names
    const monthMapping : { [key: string]: string } = {
        '一月': 'January',
        '二月': 'February',
        '三月': 'March',
        '四月': 'April',
        '五月': 'May',
        '六月': 'June',
        '七月': 'July',
        '八月': 'August',
        '九月': 'September',
        '十月': 'October',
        '十一月': 'November',
        '十二月': 'December'
    };

    // Replace Chinese month names with English month names
    
    Object.keys(monthMapping).forEach(chineseMonth => {
        this.viewOptions.columnName = this.viewOptions.columnName?.replace(chineseMonth, monthMapping[chineseMonth]);
    });

    console.log(this.viewOptions.columnName);
    this.exportImage();

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode!=undefined && isDarkMode=="1") {
      const htmlElement = document.querySelector('#gantt-chart');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
      setTimeout(() => {this.changeBackgroundColor()}, 1);
    }

    this.checkScreenSize();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    if (window.innerWidth < 1000) { // Adjust the size as per your requirement
      this.assignedChecked = false;
      this.progressChecked = false;
      this.statusChecked = false;
      this.priorityChecked = false;
    } else {
      this.assignedChecked = true;
      this.progressChecked = true;
      this.statusChecked = true;
      this.priorityChecked = true;
    }
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
  ngAfterViewInit() {
    setTimeout(() => {
      this.noTasks();
      const gantt_table_scrollbar = this.elRef.nativeElement.querySelector('.gantt .gantt-scrollbar .gantt-table-scrollbar.with-scrollbar');
      this.renderer.setStyle(gantt_table_scrollbar, 'opacity', '0');}, 0);
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode!=undefined && isDarkMode=="1") {
      setTimeout(() => {this.changeBackgroundColor()}, 1);
    }
  }

  private getCurrentPageFromUrl(url: string) : number{
    const parts = url.split('/');
    const lastPart = parts[parts.length - 2];
    return parseInt(lastPart, 10);
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
  /* ------------------------------------------------------------------------- GET TASKS --------------------------------------------------------------------- */ 
  getTasks(){
    this.Task = [];
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);
    //console.log('Calling getTasks() for id = ', this.parseid);
    
    const observable = (localStorage.getItem('userRoleName')=='Employee') ?
      this.projectService.getProjectData(this.parseid) :            // prikazuje sve taskove na kojima je dodeljen
      this.projectService.getProjectDataForManager(this.parseid);   // prikazuje sve taskove na kojima je on project manadzer ili je dodeljen na tasku
    

    observable.subscribe({
        next:(rezultat:Task[])=>
        {
            console.log(rezultat);
            this.Task=rezultat
            console.log(this.Task);
          
            // Mapiranje Taskova na GanttItem objekte
            this.items = [];
            this.groups = [];
            this.columnData = [];
            let num = 0;

            // Mapa za čuvanje zavisnosti
            const dependencyMap = new Map<number, number[]>();

            // Prvo prolazimo kroz zadatke da popunimo mapu zavisnosti
            this.Task.forEach((task) => {
                if (task.parentAssignmentID) {
                    if (!dependencyMap.has(task.parentAssignmentID)) {
                        dependencyMap.set(task.parentAssignmentID, []);
                    }
                    dependencyMap.get(task.parentAssignmentID)!.push(task.assignmentID);
                }
                //Mapa za cuvaje projectId
                this.projectIDMap.set(task.assignmentID, task.projectID!);
            });

            this.Task.forEach((task) => {

              // const startDate = new GanttDate(task.creationDate).getUnixTime();
              // const endDate = new GanttDate(task.deadline).getUnixTime();
              // const currentDate = new GanttDate(new Date().getTime()).getUnixTime(); // Current date in milliseconds
          
              // const progress = (currentDate - startDate) / (endDate - startDate);
              // const clampedProgress = Math.max(0, Math.min(progress, 1)); // Ensure progress is between 0 and 1
              // console.log(currentDate - startDate);

                this.items.push({
                  id: task.assignmentID.toString(),
                  title: task.assignmentName,
                  start: new GanttDate(task.creationDate).getUnixTime(),
                  end: new GanttDate(task.deadline).getUnixTime(),
                  group_id: task.assignmentListID.toString() ,
                  links : dependencyMap.has(task.assignmentID) ? dependencyMap.get(task.assignmentID)!.map(id => id.toString()) : [],
                  color : task.projectID !== undefined ?  this.projectColors[task.projectID % this.projectColors.length] : 'gray',
                  //(localStorage.getItem('darkMode') === '1' ? "rgb(99 102 241)" : "#F3A20D"),
                  progress: (task.progress!=undefined)? task.progress *0.01 : 1
                });

                this.columnData.push({assignees: [], status: task.status, priority: task.priority});
                this.getAssignees(task.assignmentID, num);

                 // Check if the group ID already exists in the set
                if (!this.groups.some(group => group.id === task.assignmentListID.toString())) 
                {
                  this.groups.push({ id: task.assignmentListID.toString(), title: task.assignmentListName });
                }
                num++;
            });
            console.log(this.items);
            console.log(this.groups);
            setTimeout(() => {this.noTasks();}, 1);

            const isDarkMode = localStorage.getItem('darkMode');
      
            if (isDarkMode!=undefined && isDarkMode=="1") {
              setTimeout(() => {this.changeBackgroundColor()}, 1);
            }
        },

        error:(err:any)=>
        {
            console.log(err)
        }

     })
  }
  getAssignmentsByProjectId(Id: number)
  {
      this.Task = [];
      
      console.log(this.items);
      console.log(this.groups);

      this.parseid=parseInt(localStorage.getItem('id') as string, 10);
      this.projectService.getAssignmentsByProjectIdGantt(Id,this.parseid).subscribe({
          next:(rezulatat:Task[])=>
          {
            this.Task = rezulatat;
            console.log(rezulatat);
             // Mapiranje Taskova na GanttItem objekte
            this.items = [];
            this.groups = [];
            this.columnData = [];
            let num = 0;

            // Mapa za čuvanje zavisnosti
            const dependencyMap = new Map<number, number[]>();

            // Prvo prolazimo kroz zadatke da popunimo mapu zavisnosti
            this.Task.forEach((task) => {
                if (task.parentAssignmentID) {
                    if (!dependencyMap.has(task.parentAssignmentID)) {
                        dependencyMap.set(task.parentAssignmentID, []);
                    }
                    dependencyMap.get(task.parentAssignmentID)!.push(task.assignmentID);
                }
                //Mapa za cuvaje projectId
                this.projectIDMap.set(task.assignmentID, task.projectID!);
            });
            
            this.Task.forEach((task) => 
              {
                this.items.push({
                  id: task.assignmentID.toString(),
                  title: task.assignmentName,
                  start: new GanttDate(task.creationDate).getUnixTime(),
                  end: new GanttDate(task.deadline).getUnixTime(),
                  group_id: task.assignmentListID.toString(),
                  links : dependencyMap.has(task.assignmentID) ? dependencyMap.get(task.assignmentID)!.map(id => id.toString()) : [],
                  color : Id !== undefined ?  this.projectColors[Id % this.projectColors.length] : 'gray',
                  progress: (task.progress!=undefined)? task.progress *0.01 : 1
                });
                
                this.columnData.push({assignees: [], status: task.status, priority: task.priority});
                this.getAssignees(task.assignmentID, num);

                if (!this.groups.some(group => group.id === task.assignmentListID.toString())) 
                {
                  this.groups.push({ id: task.assignmentListID.toString(), title: task.assignmentListName });
                }
                num++;
              });
            console.log("item : ", this.items);
            console.log("groups : ", this.groups);
            setTimeout(() => {this.noTasks();}, 1);

            const isDarkMode = localStorage.getItem('darkMode');
      
            if (isDarkMode!=undefined && isDarkMode=="1") {
            setTimeout(() => {this.changeBackgroundColor()}, 1);

            }
          },
  
          error:(err:any)=>
          {
              console.log(err)
          }
  
       })
  }

  selectedChange(event: GanttSelectedEvent) {
    //console.log('Open update task');
    const clickedTask = this.Task.find(task => task.assignmentID === parseInt(event.current!.id, 10));
    if (clickedTask) {
      // Extract relevant information
      const projectId = clickedTask.projectID || this.activatedRoute.snapshot.paramMap.get('projectID');
      const subProjectId = clickedTask.assignmentListID;
      const projectName = clickedTask.projectName || this.activatedRoute.snapshot.paramMap.get('ProjectName'); // Assuming you have projectName property in Task model
      const subProjectName = clickedTask.assignmentListName; // Assuming you have assignmentListName property in Task model
      const taskName = clickedTask.assignmentName; // Assuming you have assignmentName property in Task model

      // Navigate with extracted information
      this.router.navigate(['/home', projectId, subProjectId, projectName, subProjectName, event.current!.id, taskName, 'taskpage'], {
          queryParams: {
              projectName: projectName,
              subProjectName: subProjectName,
              taskName: taskName
          }
      });
    } else {
        console.error('Task not found with ID:', event.current!.id);
    }
  }

  barClick(event : GanttBarClickEvent)
  {
    if (this.dragging) {
      return;
    }
    console.log('Open task page for selected task');
    console.log(event);
    console.log(event.item.id);
    //alert("Open taskpage for task id " + event.item.id);

    // Find the task with the same ID as event.item.id
    const clickedTask = this.Task.find(task => task.assignmentID === parseInt(event.item.id, 10));
    if (clickedTask) {
      // Extract relevant information
      const projectId = clickedTask.projectID || this.activatedRoute.snapshot.paramMap.get('projectID');
      const subProjectId = clickedTask.assignmentListID;
      const projectName = clickedTask.projectName || this.activatedRoute.snapshot.paramMap.get('ProjectName'); // Assuming you have projectName property in Task model
      const subProjectName = clickedTask.assignmentListName; // Assuming you have assignmentListName property in Task model
      const taskName = clickedTask.assignmentName; // Assuming you have assignmentName property in Task model

      // Navigate with extracted information
      this.router.navigate(['/home', projectId, subProjectId, projectName, subProjectName, event.item.id, taskName, 'taskpage'], {
          queryParams: {
              projectName: projectName,
              subProjectName: subProjectName,
              taskName: taskName
          }
      });
    } else {
        console.error('Task not found with ID:', event.item.id);
    }
  }

  dragEnded (event : GanttDragEvent)
  {
    console.log('update start and end date and zavisnost');
    console.log(event);
    const startDate = this.unixToDateString(event.item.start!);
    const endDate = this.unixToDateString(event.item.end!);
    console.log("test",startDate);
    console.log("test",endDate);
    this.changeTask(Number(event.item.id), undefined, startDate, endDate);
    setTimeout(() => {this.dragging=false;}, 100);
  }

  dragStarted (event : GanttDragEvent)
  {
    console.log('drag started');
    this.dragging=true;
    console.log("broj",this.projectIDMap.get(Number(event.item.id)));
    this.getProjectStartDate(this.projectIDMap.get(Number(event.item.id))!);
    this.dateFlag=true;

  }

  dragMoved (event : GanttDragEvent)
  {
    //console.log('drag moved');
    //console.log(this.tempStartDate);
    if (this.tempStartDate>this.unixToDateString(event.item.start!) && this.dateFlag){
      console.log("task>project",this.tempStartDate, this.unixToDateString(event.item.start!));
      this.dateFlag=false;
        this.toastr.error("Task ahead of Project", 'Error', {
          positionClass: 'toast-top-right',
          timeOut: 3000
        });
    }
    else if (this.tempStartDate<this.unixToDateString(event.item.start!) && !this.dateFlag) {
      this.dateFlag=true;
    }
  }
 
  exportImage() {
    console.log(this.printService.print('gantt-chart')); // Using type assertion to call the print method
  }

  linkDragEnded($event: GanttLinkDragEvent) {
    // console.log('unese zavisnost');
    // console.log($event);
    //console.log($event.target,$event.source);
     if ($event.target?.id!==$event.source.links![0].link){
      this.changeTask(Number($event.target?.id), Number($event.source.id));
     }
     else{
      this.changeTask(Number($event.source.id), 0);
      this.changeTask(Number($event.target?.id), Number($event.source.id));
     }
      
  }

  lineClicked($event: GanttLineClickEvent) {
    console.log($event);
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastClickTime;

    if (timeDiff < 2000) {
      this.changeTask(Number($event.target.id),0);
    }

    this.lastClickTime = currentTime;
  }

  onViewChange(event: any) {
    this.viewType = event.target.value; // Update view type
    this.selectedView = event.target.value; // Update selected view
    localStorage.setItem('selectedView', this.selectedView);
  }

  openAddTaskOverlay() {
    console.log("add task overlay");
    this.refreshPage();
    this.addTaskOverlay = !this.addTaskOverlay;
    
  }

  refreshPage(){
    //kad se doda lista podzadataka bice potrebna drugacija logika
    if (this.activatedRoute.snapshot.paramMap.get('SubProjectID')!="-" && this.activatedRoute.snapshot.paramMap.get('SubProjectID')){
      //console.log("SABROJEKAT",this.activatedRoute.snapshot.paramMap.get('SubProjectID'));
      this.getAssignmentsByAssignmentListId(Number(this.activatedRoute.snapshot.paramMap.get('SubProjectID')));
    }
    else if (this.activatedRoute.snapshot.paramMap.get('projectID')!='0' && this.activatedRoute.snapshot.paramMap.get('projectID')) {
      this.getAssignmentsByProjectId(Number(this.activatedRoute.snapshot.paramMap.get('projectID')));
      this.getProjectById(Number(this.activatedRoute.snapshot.paramMap.get('projectID')));
    } else {
      this.getTasks();
    }
  }

  unixToDateString(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  changeTask(taskId: number, taskId2?:number, startDate?: string, endDate?: string) {
    if (!this.dateFlag){
      this.toastr.error("Task was ahead of Project.", 'Error', {
        positionClass: 'toast-top-right',
        timeOut: 1500
      });
      this.refreshPage();
      return;
    }
    if (taskId2 && this.projectIDMap.get(taskId)!=this.projectIDMap.get(taskId2)){
      this.toastr.error("Task can only have dependancy if the are from the same Project.", 'Error', {
        positionClass: 'toast-top-right',
        timeOut: 1500
      });
      this.refreshPage();
      return;
    }
      
    const task = this.Task.find(task => task.assignmentID === taskId);
    if (task){
      if (startDate){
        task.creationDate=startDate;
        task.deadline=endDate;
      }
      if (taskId2!==undefined)
        task.parentAssignmentID=taskId2;
      this.projectService.changeTask(task,Number(localStorage.getItem("id") !)).subscribe({
        next: (result:any) => {
          this.refreshPage();

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
          
          this.items = [];
            this.groups = [];
            this.columnData = [];
            let num = 0;

            // Mapa za čuvanje zavisnosti
            const dependencyMap = new Map<number, number[]>();

            // Prvo prolazimo kroz zadatke da popunimo mapu zavisnosti
            this.Task.forEach((task) => {
                if (task.parentAssignmentID) {
                    if (!dependencyMap.has(task.parentAssignmentID)) {
                        dependencyMap.set(task.parentAssignmentID, []);
                    }
                    dependencyMap.get(task.parentAssignmentID)!.push(task.assignmentID);
                }
                //Mapa za cuvaje projectId
                this.projectIDMap.set(task.assignmentID, task.projectID!);
            });

            this.Task.forEach((task) => 
              {
                this.items.push({
                  id: task.assignmentID.toString(),
                  title: task.assignmentName,
                  start: new GanttDate(task.creationDate).getUnixTime(),
                  end: new GanttDate(task.deadline).getUnixTime(),
                  group_id: task.assignmentListID.toString(),
                  links : dependencyMap.has(task.assignmentID) ? dependencyMap.get(task.assignmentID)!.map(id => id.toString()) : [],
                  color : task.projectID !== undefined ?  this.projectColors[task.projectID!] : 'gray',
                  progress: (task.progress!=undefined)? task.progress *0.01 : 1
                });

                this.columnData.push({assignees: [], status: task.status, priority: task.priority});
                this.getAssignees(task.assignmentID, num);

                if (!this.groups.some(group => group.id === task.assignmentListID.toString())) 
                {
                  this.groups.push({ id: task.assignmentListID.toString(), title: task.assignmentListName });
                }
                num++;
              });
            console.log("item : ", this.items);
            console.log("groups : ", this.groups);
            setTimeout(() => {this.noTasks();}, 1);

            const isDarkMode = localStorage.getItem('darkMode');
      
            if (isDarkMode!=undefined && isDarkMode=="1") {
              const htmlElement = document.querySelector('.ganttchart');
              console.log(htmlElement);
              if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));

              setTimeout(() => {this.changeBackgroundColor()}, 1);
            }
        },
      error:(err:any)=>
      {
        console.log(err)
      }

    })
  }

  changeBackgroundColor(): void {
    const ganttMainContainer = this.elRef.nativeElement.querySelector('.gantt-main-container');
    this.renderer.setStyle(ganttMainContainer, 'background-color', 'rgb(55 65 81)');

    const calendar = this.elRef.nativeElement.querySelector('.gantt-calendar svg');
    this.renderer.setStyle(calendar, 'background-color', 'rgb(55 65 81)');
    this.renderer.setStyle(calendar, 'color', 'white');

    const leftCloumn = this.elRef.nativeElement.querySelector('.gantt .gantt-side .gantt-side-container .gantt-table');
    console.log("element",this.elRef.nativeElement.querySelector('.gantt .gantt-side .gantt-side-container .gantt-table'));
    this.renderer.setStyle(leftCloumn, 'background-color', 'rgb(55 65 81)');
    this.renderer.setStyle(leftCloumn, 'color', 'rgb(156 163 175)');

    const header = this.elRef.nativeElement.querySelector('.gantt-table-header');
    //console.log("element",this.elRef.nativeElement.querySelector('.gantt-table-header'));
    this.renderer.setStyle(header, 'background-color', 'rgb(55 65 81)');
    this.renderer.setStyle(header, 'color', 'white');

    const dates = this.elRef.nativeElement.querySelectorAll('.gantt-calendar-header .primary-text');
    dates.forEach((date: HTMLElement) => {
        this.renderer.setStyle(date, 'fill', 'white');
    });

    const numbers = this.elRef.nativeElement.querySelectorAll('.gantt-calendar-header .secondary-text');
    numbers.forEach((number: HTMLElement) => {
        this.renderer.setStyle(number, 'fill', 'white');
    });
    const rightRows = this.elRef.nativeElement.querySelectorAll('.gantt .gantt-main-container .gantt-group');
    rightRows.forEach((rightRow: HTMLElement) => {
        this.renderer.setStyle(rightRow, 'background', 'rgb(75 85 99)');
    });
    //grupe taskova
    // const taskGroups = this.elRef.nativeElement.querySelectorAll('.gantt-table-body .gantt-table-item');
    // console.log("elements", taskGroups);
    // taskGroups.forEach((taskGroup: HTMLElement) => {
    //     this.renderer.setStyle(taskGroup, 'background-color', 'rgb(55 65 81)');
    // });

    const body = this.renderer.selectRootElement('body', true);
    this.renderer.setStyle(body, 'background-color', 'rgb(31 41 55)');


    const tableGroup = this.elRef.nativeElement.querySelectorAll('.gantt-table-group');
    //this.renderer.setStyle(tableGroup, 'background-color', 'rgb(75 85 99)');
    tableGroup.forEach((taskGroup: HTMLElement) => {
          this.renderer.setStyle(taskGroup, 'background-color', 'rgb(75 85 99)');
          this.renderer.setStyle(taskGroup, 'color', 'white');
      });
      
    // const textContent = this.elRef.nativeElement.querySelector('.gantt-table-header').innerText;
    // console.log(textContent);

    // const ganttTableHeaderContainer = this.elRef.nativeElement.querySelector('.gantt-table-header-container');
    // const ganttTableColumn = ganttTableHeaderContainer.querySelector('.gantt-table-column');

    // // Pronalaženje čvora koji sadrži tekst "All Tasks" unutar ganttTableColumn
    // Array.from(ganttTableColumn.childNodes).forEach((node: any) => {
    //   if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim() === 'All Tasks') {
    //     // Ako je pronađen, promenite tekst na "Svi taskovi"
    //     this.renderer.setValue(node, 'Svi taskovi');
    //   }
    // });
 }

 noTasks(): void{
    const emptyTextElement = this.elRef.nativeElement.querySelector('.empty-text');
    if (emptyTextElement && emptyTextElement.innerText.trim() === '没有数据') {
      this.renderer.setProperty(emptyTextElement, 'innerText', 'No tasks');
    }
 }

 getColumnData(item: GanttItem<unknown>){
    const index = this.items.indexOf(item);
    return this.columnData[index];
  }

  getAssignees(Id: number, num: number){
    this.projectService.getAssignmentWithComments(Id).subscribe({
        next:(rezulatat:Task)=>
        {
            this.columnData[num].assignees=rezulatat.assignedUsers;
            //this.taskWithComments=rezulatat;
            //console.log("useri", this.taskWithComments.assignedUsers);
        },
        error:(err:any)=>
        {
            console.log(err)
        }
     })
  }

  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }

  scrollToToday() {
    this.ganttComponent.scrollToToday();
  }

  getProjectStartDate(userID:number){
    this.projectService.getProject(userID).subscribe({
      next:(result:any)=>
        {
            console.log(result);
            this.tempStartDate=(result.startDate as string).split('T')[0];
            //console.log("start date",this.tempStartDate);
        },

        error:(err:any)=>
        {
            console.log(err);
        }
    })
  }

  toggleFilters() {
    this.showFilter = !this.showFilter;
    this.showOverlay = !this.showOverlay;
  }

}


export class GanttViewOptions {
  viewType?: GanttViewType;
  start?: GanttDate; 
  end?: GanttDate;   
  min?: GanttDate;   
  max?: GanttDate;   
  cellWidth?: number;    
  addAmount?: number;    
  addUnit?: GanttDateUtil; 
  dateFormat?: GanttDateFormat; 
  datePrecisionUnit?: 'day' | 'hour' | 'minute'; 
  dragPreviewDateFormat?: string; 
  columnName?: string; // New property to specify the column name for the date
}

export interface GanttGlobalConfig{
  dateFormat?: {
    day?: string,
    week?: string, 
    month?: string, 
    quarter?: string, 
    year?: string, 
    yearMonth?: string, 
    yearQuarter?: string 
  };
  dateOptions: {
    locale?: Locale, 
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 
  };
  linkOptions: {
    dependencyTypes?: GanttLinkType[], 
    showArrow?: boolean,
    lineType?: GanttLinkLineType 
  };
  styleOptions?: {
    headerHeight?: number,
    lineHeight?: number, 
    barHeight?: number 
  };
}
