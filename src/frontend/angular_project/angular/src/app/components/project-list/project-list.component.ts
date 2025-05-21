import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AssignmentList } from '../../models/AssigmentList';
import { Project } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { ProjectCommunicationServiceService } from '../../services/project-communication-service.service';
import { TaskListCommunicationService } from '../../services/task-list-communication.service';
import { TaskListAllTasksCommunicationService } from '../../services/task-list-all-tasks-communication.service';
import { TaskListSubprojectCommunicationService } from '../../services/task-list-subproject-communication.service';
import { Router } from '@angular/router';
import { Task_List_Communication_String } from '../../services/Task_List_Communication_String';
import { TranslateService } from '@ngx-translate/core'
import { DarkModeService } from '../../services/dark-mode.service';
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent {
  showAllTasksInList : boolean = true;
  flag : boolean = false;
  projects!:any[];
  showList: boolean = false;
  isDarkMode: boolean = false;
  showListId!: number;
  show: boolean = true;
  UserCount!: string;
  ActiveTaskCount!: string;
  CopletedTaskCount!: string;  
  asssigmentList!:AssignmentList[];
  selectedItem: number = 0;
  selectedItem2!:number;
  filteredStrings: string[] = [];
  strings: string[] = [];
  filteredProjects!: any[]; // Your initial list of projects
  parseid!: number;
  selectedLanguage : string = "en";
  selectedProjects: Set<number> = new Set<number>(); // Initialize selectedProjects as a Set
  selectedSubprojects: Map<number, Set<number>> = new Map<number, Set<number>>(); // Initialize selectedSubprojects as a Map
  constructor(private taskListSubprojectCommunicationService: TaskListSubprojectCommunicationService, 
              private taskListAllTasksCommunicationService:TaskListAllTasksCommunicationService,private projectCommunicationService: ProjectCommunicationServiceService,
              private TaskListStringCommunication: Task_List_Communication_String,private taskListCommunicationService: TaskListCommunicationService,
              private projectService: ProjectService,private projectdasboardService:ProjectdashboardService, private router : Router,
              private renderer: Renderer2,
              private elementRef: ElementRef,private translateService:TranslateService,
              private darkModeService : DarkModeService
            ){}
            // projectColors: string[] = [
            //   "#FF69B4", // Deep Pink
            //   "#87CEEB", // Sky Blue
            //   "#FFD700", // Gold
            //   "#7FFFD4", // Aquamarine
            //   "#FFA07A", // Light Salmon
            //   "#20B2AA", // Light Sea Green
            //   "#BA55D3", // Medium Orchid
            //   "#FF6347", // Tomato
            //   "#40E0D0", // Turquoise
            //   "#9370DB", // Medium Purple
            //   "#00BFFF", // Deep Sky Blue
            //   "#00FF7F", // Spring Green
            //   "#FFC0CB", // Pink
            //   "#F0E68C", // Khaki
            //   "#DA70D6", // Orchid
            //   "#FFA500", // Orange
            //   "#7FFF00", // Chartreuse
            //   "#AFEEEE", // Pale Turquoise
            //   "#DDA0DD", // Plum
            //   "#66CDAA", // Medium Aquamarine
            //   "#FFE4E1", // Misty Rose
            //   "#FA8072", // Salmon
            //   "#9370DB", // Medium Purple
            //   "#FFE4B5", // Moccasin
            //   "#98FB98", // Pale Green
            //   "#DDA0DD", // Plum
            //   "#FAFAD2", // Light Goldenrod Yellow
            //   "#7B68EE", // Medium Slate Blue
            //   "#FFB6C1", // Light Pink
            //   "#4682B4", // Steel Blue
            // ];
            projectColors: string[] = [
             
            ];
            
  ngOnInit(): void 
  {
    this.getProjects();
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    console.log("pa ovo je to "+this.projects);
    this.getAssignementList();

    const parts = this.router.url.split('/');
    const pageName = parts[parts.length - 1];
    if (pageName == 'statistics' || pageName =='kanban' ) this.showAllTasksInList = false;
    else this.showAllTasksInList = true;

    const currentPage = this.getCurrentPageFromUrl(this.router.url);
    // console.log(currentPage);
    const subProject = this.getCurrentSubProjectFromUrl(this.router.url);
    if (!isNaN(subProject))
    {
      this.selectedItem = currentPage;
      this.taskListSubprojectCommunicationService.sendId(subProject);
    }
    else if (!isNaN(currentPage)) {
      this.selectedItem = currentPage;
      //console.log("Saljem ", this.selectedItem);
      this.taskListCommunicationService.sendId(this.selectedItem);
      //console.log("Poslao");
    } else {
      this.selectedItem = 0;
      this.taskListAllTasksCommunicationService.sendSignal();
    }

    if (this.filteredProjects && this.filteredProjects.length > 0) {
      this.selectedItem = this.filteredProjects[0].projectID;
    }
    const AllTasks=(this.router.url.split('/')[4]);
    const subProjectId = parseInt(this.router.url.split('/')[3], 10);
    if( AllTasks == "All-Tasks" || AllTasks == "All-Tasks")
    {
      this.selectedItem=0;
      this.ChangeCards2(0,'All Tasks')
      console.log('usao u change cards 2 i guess');
    }
    else if(!isNaN(subProjectId) && subProjectId !== 0) {
      
      console.log("Subproject ID: ", subProjectId);
      this.flag = true;
      this.selectedItem=-1;
      this.selectedItem2=subProjectId;
      const parts = this.router.url.split('/');
      this.showListId = parseInt(parts[2], 10);
      

      const ProjectName = decodeURIComponent(parts[4] || 'home');
      const SubProjectName = decodeURIComponent(parts[5]);
      this.SubProjectActivate(this.showListId, SubProjectName, subProjectId, ProjectName);
      
    }

    const isDarkMode = localStorage.getItem('darkMode');
      
      if (isDarkMode) {
        const htmlElement = document.querySelector('.dark-theme');
        if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
      }
      // Subscribe to dark mode changes
      this.darkModeService.darkModeSubject.subscribe(isDarkMode => {
        this.isDarkMode = isDarkMode;
        document.querySelector('.dark-theme')?.classList.toggle('dark', JSON.parse(isDarkMode.toString()));
      });
  

  }
  
  private getCurrentPageFromUrl(url: string) : number{
    const parts = url.split('/');
    const lastPart = parts[2];
    console.log(parts);
    return parseInt(lastPart, 10);
  }
  private getCurrentSubProjectFromUrl(url: string) : number{
    const parts = url.split('/');
    const lastPart = parts[3];
    console.log(parts);
    return parseInt(lastPart, 10);
  }
  
  getProjects()
  {
    this.parseid=parseInt(localStorage.getItem('id') as string, 10);
    this.projectdasboardService.getAssignmentById(this.parseid).subscribe({
       next:(rezulatat:Project[])=>
       {
           this.filteredProjects=rezulatat;
           this.projects=rezulatat
           this.projects.forEach((project) => (project.startDate = new Date(<Date>project.startDate)));
           this.projects.forEach((project) => (project.endDate = new Date(<Date>project.endDate)));
           
           const parts = this.router.url.split('/');
           if (parts[parts.length - 1] == 'ganttchart')
           this.projects.forEach((project, index) => {
            project.backgroundColor = this.projectColors[project.projectID % this.projectColors.length];
          });
       },

       error:(err:any)=>
       {
           console.log(err)
       }

    })
  }
   
  applyFilterGlobal(event: Event) 
  {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProjects = this.projects
      .filter(project => project.projectName.toLowerCase().includes(filterValue));
  }
   toggleList(Id:number): void {
    this.showList = !this.showList;
    this.showListId=Id;
  }
  ChangeCards(Id:number,Name:string): void{

    this.getActiveTaskCount(Id);
    this.getCompletedTaskCount(Id);
    this.getUserCount(Id);
    this.selectedItem=Id;
    this.selectedItem2=-1;
    this.sendStringToService(Name);
    this.sendIdToService(Id);

    const currentUrl = this.router.url;
    const segments = currentUrl.split('/'); // Split the URL into segments
    let routeSegment = 'home'; // Default route segment if none found

    // segments.forEach((segment, index) => {
    //   if (segment === 'home') {
    //     if (index + 2 < segments.length) { // Check if there's a segment after 'home'
    //       routeSegment = segments[index + 2]; // Set route segment to the next segment
    //     }
    //   }
    // });
    // Navigate to the new URL with the updated project ID and route segment
    
    // if (routeSegment =="home" && segments.length == 2) 
    routeSegment=segments[segments.length-1];
    //console.log('/home', Id, routeSegment);
    //console.log(segments.length);
    //this.router.navigate(['/home', Id, 'view']);
   

    // Replacing spaces with hyphens in SubProjectName
    

    this.router.navigate(['/home', Id,'-',Name.replace(/\s+/g, '-'),'-',routeSegment]);
  }
  SubProjectActivate(Id:number,name:string,assignmentListID:number,projectName: string): void{
    this.sendSubproject(assignmentListID);
    this.sendStringToTaskListService(name,projectName);
    //console.log('uslo u subproject');
    this.selectedItem=-1;
    this.selectedItem2=assignmentListID
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/');
    let routeSegment = 'home';

    routeSegment=segments[segments.length-1];
    this.router.navigate(['/home', Id,assignmentListID,projectName.replace(/\s+/g, '-'),name.replace(/\s+/g, '-'),routeSegment]);
   
 }
  ChangeCards2(Id:number,Name:string): void{
    this.getActiveTaskCount(Id);
    this.getCompletedTaskCount(Id);
    this.getUserCount(Id);
    this.selectedItem=Id;
    this.sendStringToService('All Tasks');
    this.sendSignalService();
    this.selectedItem2=-1;

    const currentUrl = this.router.url;
    const segments = currentUrl.split('/'); 
    let routeSegment = 'home';
     

  
    routeSegment=segments[segments.length-1];
    this.router.navigate(['/home', Id,'-',Name=Name.replace(/\s+/g, '-'),'-',routeSegment]);
  }
  sendStringToService(str: string): void {
    this.projectCommunicationService.sendString(str);
  }
  sendStringToTaskListService(str: string,str2: string): void{
    this.TaskListStringCommunication.sendString(str,str2);
  }
  sendIdToService(Id: number): void{
    console.log('Send Id to service');
    this.taskListCommunicationService.sendId(Id);
  }
  sendSignalService(): void{
    this.taskListAllTasksCommunicationService.sendSignal();
  }
  sendSubproject(Id:number): void{
    console.log('Send subproject id to service');
    this.taskListSubprojectCommunicationService.sendId(Id);
  }
  getUserCount( Id: number)
    {
        this.projectService.getUserCount(Id).subscribe({
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

    getActiveTaskCount(Id: number)
    {
        this.projectService.getActiveTaskCount(Id).subscribe({
            next:(count:string)=>
            {
                this.ActiveTaskCount=count;
            },
            error:(err:any)=>
            {
                console.log(err)
            }
        })
    }
    getCompletedTaskCount(Id: number)
    {
        this.projectService.getCompletedTaskCount(Id).subscribe({
            next:(count:string)=>
            {
                this.CopletedTaskCount=count;
            },
            error:(err:any)=>
            {
                console.log(err)
            }
        })
    }
    getAssignementList()
    {
        this.projectService.getAssignmentList().subscribe({
            next:(rezulatat:AssignmentList[])=>
            {
              
                this.asssigmentList=rezulatat;
                console.log(this.asssigmentList);
            },
    
            error:(err:any)=>
            {
                console.log(err)
            }
    
         })
    }
}
