import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { Project } from '../../models/project';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';


@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss'
})
export class ProjectDashboardComponent implements OnInit{
  constructor(private snackBar: MatSnackBar,private toastr: ToastrService,private projectdasboardService:ProjectdashboardService,private confirmationService:ConfirmationService,private messageService:MessageService,private router: Router, private translateService:TranslateService,private primeNGConfig: PrimeNGConfig) { }


  cols!: {};
  selectedColumns!: {}
  projectID!:number
  tempProject!:Project
  projects:Project[]=[];
  data: any;
  options: any;
  role!:string
  showButton: boolean = false; 
  showFilters: boolean = false;
  showOverlay: boolean = false;
  openDismissOverlay: boolean = false;
  openOverlay: boolean = false;
  openUpdateOverlay: boolean = false;
  importantChecked: boolean = false;
  urgentChecked: boolean = false;
  notUrgentNotImportantChecked: boolean = false;
  urgentNotImportantChecked: boolean = false;
  isDarkMode : boolean = false;
  isReportOpen: boolean = true;
  userID!:string
  parsUserID!:number
  statuses!: any[];
  projectFilter: string = '';
  plannedProject!:string
  projectCountByUser!:string
  activeProjectCountByUser!:string
  comletedProjectCountByUser!:string
  selectedLanguage : string = "en";
  colEndValue: number = 6;
  projectLeaders: any[] = [];
  filteredLeaders: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;
  
  parseDate(dateString: string): Date | null {
    const [month, day, year] = dateString.split('/').map(Number);
    if (!month || !day || !year) {
      return null; // Nevažeći datum
    }
    return new Date(year, month - 1, day);
  }
  get filteredProjects() {
    const filterWords = this.projectFilter ? this.projectFilter.toLowerCase().split(' ') : [];
  
    return this.projects.filter(project => {
      const projectName = project.projectName.toLowerCase();
      
    
      const projectLeaderFullName = (project.projectLeaderFirstName + ' ' + project.projectLeaderLastName).toLowerCase();
      
      const projectStatus = project.status.toLowerCase();
      
     
      const projectStartDate = typeof project.startDate === 'string' ? this.parseDate(project.startDate) : project.startDate;
      const projectEndDate = typeof project.endDate === 'string' ? this.parseDate(project.endDate) : project.endDate;
  
    
      const matchesProjectName = filterWords.every(word => projectName.includes(word));
      const matchesManagerName = filterWords.every(word => projectLeaderFullName.includes(word));
      const matchesStatus = filterWords.every(word => projectStatus.includes(word));
  
    
      const matchesStartDate = projectStartDate ? this.dateMatchesFilter(projectStartDate, filterWords) : false;
      const matchesEndDate = projectEndDate ? this.dateMatchesFilter(projectEndDate, filterWords) : false;

      const matchesLeaderID = this.filteredLeaders.length === 0 || this.filteredLeaders.includes(project.projectLeaderID);

      return (matchesProjectName || matchesManagerName || matchesStatus || matchesStartDate || matchesEndDate) && matchesLeaderID;
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
  ngOnInit():void {
     this.role=localStorage.getItem('userRoleName') as string
     this.userID=localStorage.getItem('id') as string 
     this.parsUserID=parseInt(this.userID)
     this.getProjectCountByUser(this.parsUserID)
     this.getPlannedProjectsCountByUser(this.parsUserID)
     this.getActiveProjectCountByUser(this.parsUserID)
     this.getCompletedProjectCountByUser(this.parsUserID)
     this.getProjectsByUser(this.parsUserID)
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

    this.statuses = [
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Planned', value: 'Planned' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Dismissed', value: 'Dismissed' },
    ];

    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode) {
      const htmlElement = document.querySelector('#projectHtml');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
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
 

  toggleOverlay() {
   
    this.openOverlay = !this.openOverlay;
  }

  

  toggleUpdateOverlay() {


   
    this.openUpdateOverlay = !this.openUpdateOverlay;
  }
  

  
  toggleUpdateOverlay1(projectID:number) {

    this.projectID=projectID
    this.openUpdateOverlay = !this.openUpdateOverlay;
  }


    getProjects(){
     this.projectdasboardService.getProjects().subscribe({
        next:(rezulatat:Project[])=>
        {
          
            this.projects=rezulatat
            this.projects.forEach((project) => (project.startDate = new Date(<Date>project.startDate)));
            this.projects.forEach((project) => (project.endDate = new Date(<Date>project.endDate)));
        },

        error:(err:any)=>
        {
            console.log(err)
        }

     })
    }


    getProjectsByUser(userID:number){
      this.projectdasboardService.getProjectsByUser(userID).subscribe({
         next:(rezulatat:Project[])=>
         {
           
             this.projects=rezulatat
             this.projects.forEach((project) => (project.startDate = new Date(<Date>project.startDate)));
             this.projects.forEach((project) => (project.endDate = new Date(<Date>project.endDate)));
             
             this.projects.forEach((project) => {
              // Proverite da li menadžer već postoji u projectLeaders nizu
              const existingLeader = this.projectLeaders.find(
                (leader) => leader.projectLeaderID === project.projectLeaderID
              );
            
              // Ako menadžer ne postoji, dodajte ga u projectLeaders niz
              if (!existingLeader) {
                this.projectLeaders.push({
                  projectLeaderID: project.projectLeaderID,
                  projectLeaderFirstName: project.projectLeaderFirstName,
                  projectLeaderLastName: project.projectLeaderLastName,
                  projectLeaderURL: project.projectLeaderURL
                });
              }
            });

             console.log(rezulatat)
             console.log(this.projectLeaders);
             // Define the order of statuses
            const statusOrder = [
              'In Progress',
              'Planned',
              'Completed',
              'Dismissed'
            ];

            // Sort projects based on statusOrder
            this.projects.sort((a, b) => {
              return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
            });

            console.log(this.projects);
         },
 
         error:(err:any)=>
         {
             console.log(err)
         }
 
      })
     }
 


 
    updateProjectList(projects:Project[]){
        this.projects=projects

        this.translateService.get("Project has been updated").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }

     
      getProjectCountByUser(userID:number){
        this.projectdasboardService.getProjectCountByUser(userID).subscribe({

          next:(res:string)=>{
                this.projectCountByUser=res
               
               
          },
          error:(err:any)=>{
            console.log(err)
          }
        })
      }

      getPlannedProjectsCountByUser(userID:number){
        this.projectdasboardService.getPlannedProject(userID).subscribe({
  
          next:(res:string)=>{
              this.plannedProject=res
          },
          error:(err:any)=>{
            console.log(err)
          }
        })
      }


      getActiveProjectCountByUser(userID:number){
        this.projectdasboardService.getActiveProject(userID).subscribe({

          next:(res:string)=>{
                this.activeProjectCountByUser=res
              
          },
          error:(err:any)=>{
            console.log(err)
          }
        })
      }

      getCompletedProjectCountByUser(userID:number){
        this.projectdasboardService.getCompletedProject(userID).subscribe({

          next:(res:string)=>{
                this.comletedProjectCountByUser=res
               
          },
          error:(err:any)=>{
            console.log(err)
          }
        })
      }


     
    

      projectName1!:string
      desc1!:string
      status1!:string
      startDate1!:Date | string
      endDate1!:Date | string
      

      report(project:Project){
        this.projectName1=project.projectName
        this.status1=project.status
        this.startDate1=project.startDate
        this.endDate1=project.endDate
        this.desc1=project.description
        
    }
   

      getProjectID(userID:number){
       
        this.projectdasboardService.getProject(userID).subscribe({
          next:(result:Project)=>
            {
               this.report(result)
            },
    
            error:(err:any)=>
            {
                console.log(err);
            }
        })
      }


      


      sendProjectkWithNotifications(projectID:number,projectName:string){
      
        
     
        projectName = projectName.replace(/\s+/g, '-');
        this.router.navigate(['/home', projectID,'-',projectName,'-','view',]);
       
      }
      closeReport()
      {
        this.isReportOpen=true;
        this.colEndValue = 6;
      }

      dismissProject(project:Project) {
        this.tempProject=project;
        this.openDismissOverlay = !this.openDismissOverlay;
      }
    
      toggleDismissOverlay() {
        this.openDismissOverlay = !this.openDismissOverlay;
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
             
              header.forEach((key, index) => {
                const trimmedKey = key.trim(); 
                if (trimmedKey.toLowerCase() !== 'projectid' &&  trimmedKey.toLowerCase() !== 'id') { 
                  obj[trimmedKey] = row[index]?.trim();
                }
              });
            }
            return obj;
          });
          this.importProjects(data);
        };
        reader.readAsText(file);
      }

     
      importProjects(data: any[]) {
        console.log('Imported projects:', data);
       
        data.forEach(project => {
          
          console.log(project);
        
          this.projectdasboardService.createProject(project,Number(localStorage.getItem("id") !)).subscribe({
            next : response => {
              console.log('Project added :', response);


              this.translateService.get("Projects have been imported").subscribe((translatedMessage: string) => {
                this.toastr.success(translatedMessage, 'Success', {
                  positionClass: 'toast-top-right',
                  timeOut: 1500
                });
              });

            },
            error : error =>{

              this.translateService.get("Projects was not imported").subscribe((translatedMessage: string) => {
                this.toastr.error(translatedMessage, 'Error', {
                  positionClass: 'toast-top-right',
                  timeOut: 1500
                });
              });

              console.error('Error adding project :', error);
            }
          });
    
          this.getProjectsByUser(this.parsUserID)
        });
        this.ngOnInit();
      }


      hasProjects(): boolean {
        return this.filteredProjects.length > 0;
      }


      exportProjects(){
        console.log(this.projects);
    if(this.hasProjects()){
      const plainProjects = this.projects.map(project => ({
        ProjectID: project.projectID,
        ProjectName: project.projectName,
        ProjectLeader:project.projectLeaderFirstName+" "+project.projectLeaderLastName,
        StartDate: project.startDate,
        EndDate:project.endDate,
        Status:project.status,
        Description:project.description.replace(/\n/g, ' ')

      }));
  
      
      const csvContent = this.generateCSVContent(plainProjects);
  
     
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
     
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.setAttribute('download', 'Projects.csv');
  
     
      document.body.appendChild(downloadLink);
      downloadLink.click();
  
    
      document.body.removeChild(downloadLink);

      this.translateService.get("Projects have been exported").subscribe((translatedMessage: string) => {
        this.toastr.success(translatedMessage, 'Success', {
          positionClass: 'toast-top-right',
          timeOut: 1500
        });
      });


    }
        
      } 

      private generateCSVContent(projects: any[]): string {
        const headers = Object.keys(projects[0]).join(',');
        const rows = projects.map(project => Object.values(project).join(',')).join('\n');
        return `${headers}\n${rows}`;
      }

  tasks: any[] = [
    {
      taskId: 1,
      taskName: "Layout Page",
      taskDescription: "Some short description for the layout page",
      status: "Planned",
      projectName: "Project1",
      important: true,
      urgent:true
    },
    {
      taskId: 2,
      taskName: "Design Page",
      taskDescription: "Some short description for the design page",
      status: "Planned",
      projectName: "Project1",
      important: true,
      urgent:false
    },
    {
      taskId: 3,
      taskName: "Development Page",
      taskDescription: "Some short description for the development page",
      status: "In Progress",
      projectName: "Project1",
      important: false,
      urgent:true
    },
    {
      taskId: 4,
      taskName: "Testing Page",
      taskDescription: "Some short description for the testing page",
      status: "In Progress",
      projectName: "Project1",
      important: true,
      urgent:true
    },
    {
      taskId: 5,
      taskName: "Deployment Page",
      taskDescription: "Some short description for the deployment page",
      status: "Completed",
      projectName: "Project1",
      important: true,
      urgent:false
    },
    {
      taskId: 6,
      taskName: "Review Page",
      taskDescription: "Some short description for the rewiew page",
      status: "Completed",
      projectName: "Project1",
      important: true,
      urgent:true
    },
    {
      taskId: 7,
      taskName: "Delivery Page",
      taskDescription: "Some short description for the delivery page",
      status: "Rejected",
      projectName: "Project1",
      important: false,
      urgent:false
    },
  ];

  currentItem:any;

 


  filterTasks(status: string): any[] {
    return this.tasks.filter(item => {
      if (
          (!this.importantChecked && !this.urgentChecked && !this.urgentNotImportantChecked && !this.notUrgentNotImportantChecked) ||
          (this.importantChecked && item.important && !item.urgent) ||
          (this.urgentChecked && item.urgent && item.important) ||
          (this.urgentNotImportantChecked && item.urgent && !item.important) ||
          (this.notUrgentNotImportantChecked && !item.urgent && !item.important)
      ) {
          return item.status === status;
      } else {
          return false;
      }
  });
  }



  onDragStart(item:any){
   
    this.currentItem = item;
  }

  onDrop(event: any, status: string){
   
    event.preventDefault();
    const record = this.tasks.find(t => t.taskId == this.currentItem.taskId);
    if(record != undefined){
      record.status = status;
    }
    this.currentItem = null;
  }

  onDragOver(event: any){
   
    event.preventDefault();
  }


  toggleFilters() {
    this.showFilters = !this.showFilters;
    this.showOverlay = !this.showOverlay;
  }


  getIconUrl(item: any): string {
    if (item.important && !item.urgent) {
      return '../../../assets/images/important_kanban.svg';
    } else if (item.important && item.urgent) {
      return '../../../assets/images/urgent_kanban.svg';
    } else if (item.urgent && !item.important) {
      return '../../../assets/images/urgent_not_important_kanban.svg';
    } else {
      return '../../../assets/images/not_urgent_not_important.svg';
    }
  }

  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }

 filter2(event:Event){
  if (Array.isArray(event)) {
    this.filteredLeaders = event.map(item => item.projectLeaderID);
    console.log(this.filteredLeaders);
  } 
 }

}





