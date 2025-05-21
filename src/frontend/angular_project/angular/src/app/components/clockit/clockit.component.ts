import { Component } from '@angular/core';
import { Project } from '../../models/project';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { Task } from '../../models/Task';
import { ProjectService } from '../../services/project.service';
import { ToastrService } from 'ngx-toastr';
import { ClockitService, Entry } from '../../services/clockit.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-clockit',
  templateUrl: './clockit.component.html',
  styleUrl: './clockit.component.scss'
})
export class ClockitComponent {
  userID !: number;
  projects !: Project[];
  tasks !: Task[];
  entries !: any[];

  groupedEntries: any[] = [];

  selectedProject : number = 0;
  selectedTask : number = 0;
  taskDescription : string = "" ;
  selectedLanguage : string = "en";
  timer : any;
  startTime : Date = new Date();
  elapsedTime : number = 0;
  isDarkMode: boolean = false;
  constructor(private projectdasboardService:ProjectdashboardService, private projectService : ProjectService, 
    private toastr : ToastrService, private clockITService:ClockitService, private router : Router,private translateService:TranslateService,private darkModeService: DarkModeService) {}

  ngOnInit():void {
    this.userID = parseInt(localStorage.getItem('id') as string, 10);
    this.getProjectsByUser(this.userID);
    this.getTasks(this.userID);
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    const isDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = this.darkModeService.getDarkMode();
    
    if (isDarkMode) document.querySelector('#clolkIT')?.classList.toggle('dark', JSON.parse(isDarkMode));

    this.getEntries();
    //Check if there's a task in progress
    const savedStartTime = localStorage.getItem('startTime');
    if (savedStartTime) {
      const savedElapsedTime = parseInt(localStorage.getItem('elapsedTime') as string, 10);
      this.startTime = new Date(savedStartTime);
      this.elapsedTime = savedElapsedTime;
      this.startTimer();
    }
  }

  // ngOnDestroy(): void {
  //   clearInterval(this.timer);
  //   localStorage.removeItem('startTime');
  //   localStorage.removeItem('elapsedTime');
  // }
  
  getProjectsByUser(userID:number){
    this.projectdasboardService.getProjectsByUser(userID).subscribe({
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
    });
   }


   
 getTasks(userID:number){
  const observable = (localStorage.getItem('userRoleName')=='Employee') ?
    this.projectService.getProjectData(userID) :            // prikazuje sve taskove na kojima je dodeljen
    this.projectService.getProjectDataForManager(userID);   // prikazuje sve taskove na kojima je on project manadzer ili je dodeljen na tasku
  
  observable.subscribe({
      next:(rezultat:Task[])=>
      {
          this.tasks=rezultat;
          this.tasks.forEach((task) => (task.creationDate = new Date(<Date>task.creationDate)));
          this.tasks.forEach((task) => (task.deadline = new Date(<Date>task.deadline)));    
      },
      error:(err:any)=>
      {
          console.log(err)
      }
   });
  }

  getAssignmentsByProjectId(Id: number)
  {
      const observable = (localStorage.getItem('userRoleName')=='Employee')? //|| this.ProjectInfo.projectLeaderID != this.parseid) ? // ako je zaposleni ili mu je dodeljen task na projektu samo
                        this.projectService.getAssignmentsByProjectId(Id, this.userID):
                        this.projectService.getAssignmentsByProjectIdForManagerMarija(Id, this.userID);
      
      observable.subscribe({
          next:(rezulatat:Task[])=>
          {
              this.tasks=rezulatat
              this.tasks.forEach((task) => (task.creationDate = new Date(<Date>task.creationDate)));
              this.tasks.forEach((task) => (task.deadline = new Date(<Date>task.deadline)));
          },
          error:(err:any)=>
          {
              console.log(err)
          }
       });
  }

  onProjectChange(event : Event): void {
    const projectID = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedProject = projectID;
    
    if (projectID == 0) this.getTasks(this.userID);
    else this.getAssignmentsByProjectId(projectID);
  }

  onTaskChange(event: Event): void {
    const taskID = parseInt((event.target as HTMLSelectElement).value, 10);
    const selectedTask = this.tasks.find(task => task.assignmentID === taskID);
    this.selectedTask = taskID;
    if (selectedTask) {
      this.selectedProject = selectedTask.projectID? selectedTask.projectID : 0;
    }
  }

  async startTask(description? : string, selectedProject?: number, selectedTask?: number): Promise<void> {
    const projectId = selectedProject !== undefined ? selectedProject : this.selectedProject;
    const assignmentId = selectedTask !== undefined ? selectedTask : this.selectedTask;
    const taskDescription = description !== undefined ? description : this.taskDescription;
   
    console.log("start with : ",projectId, assignmentId, taskDescription);

    if (taskDescription=='' || projectId === 0 || assignmentId === 0){
      this.translateService.get("All fields are required.").subscribe((translatedMessage: string) => {
        this.toastr.error(translatedMessage, 'Error', {
          positionClass: 'toast-top-right',
          timeOut: 1500
        });
      });

      return;
    } 
    
    try {

      // Stop all running tasks
      const runningEntries = this.entries.filter((entry) => !entry.timeEntry.endTime);
      for (const entry of runningEntries) {
        console.log('Stoping task ', entry);
        await this.stopTask(entry.timeEntry.timeEntryID);
      }

      const entry: Entry = {
        userId : this.userID,
        projectId : projectId,
        assignmentId : assignmentId,
        Desc : taskDescription
      };

      this.clockITService.createNewEntry(entry).subscribe({
        next:(rezultat: any)=>
        {
          console.log(rezultat);
         

          this.translateService.get("Timer started.").subscribe((translatedMessage: string) => {
            this.toastr.success(translatedMessage, 'Success', {
              positionClass: 'toast-top-right',
              timeOut: 1500
            });
          });
          

          //localStorage.setItem('startTime', this.startTime.toISOString());
          localStorage.setItem('elapsedTime', this.elapsedTime.toString());
          this.startTimer();

          this.getEntries();
        },
        error:(err:any)=>
        {
            console.log(err)
        }
      });

    }
    catch(error){
      console.error('Failed to stop running tasks :', error);
    }
  }

  getEntries() : void{
    this.clockITService.getUserTimeEntries(this.userID).subscribe({
      next:(rezultat: any[])=>
      {
        console.log(rezultat);

        this.entries = rezultat.map(element => {
          element.timeEntry.hours = Math.floor(element.timeEntry.durationInMinutes / 60);
          return element;
        }).sort((a, b) => {
          const endTimeA = new Date(a.timeEntry.endTime).getTime();
          const endTimeB = new Date(b.timeEntry.endTime).getTime();
          return endTimeA - endTimeB;
        });

        this.groupEntries();
      },
      error:(err:any)=>
      {
          console.log(err)
      }
    });
  }
  
  stopTask(timeEntryId: number): void {
    // Save the updated entry back to the server
    this.clockITService.endEntry(timeEntryId).subscribe({
      next: (res) => {
        console.log(res);
        this.translateService.get("Task stopped successfully.").subscribe((translatedMessage: string) => {
          this.toastr.success(translatedMessage, 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });

        this.getEntries(); 
        clearInterval(this.timer);
        this.timer = null;
        this.startTime = new Date();
        this.elapsedTime = 0;
        localStorage.removeItem('startTime');
        localStorage.removeItem('elapsedTime');
          
      },
      error: (err) => {
        console.log(err);
        this.translateService.get("Failed to stop task.").subscribe((translatedMessage: string) => {
          this.toastr.error(translatedMessage, 'Error', {
            positionClass: 'toast-top-right',
            timeOut: 1500
          });
        });
      }
    });
  }
  startTimer() {
    //console.log("Timer",this.timer,localStorage.getItem('startTime'));
    if (localStorage.getItem('startTime'))
      this.startTime = new Date(localStorage.getItem('startTime')!);
    else
    {
      localStorage.setItem('startTime', (new Date()).toISOString());
      this.startTime=new Date();
    }
    if (!this.timer) {
      this.timer = setInterval(() => {
        // Calculate elapsed time
        const currentTime = new Date();
        this.elapsedTime = Math.floor((currentTime.getTime() - this.startTime.getTime() + this.elapsedTime) / 1000);
      }, 1000);
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }
  
  pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
  /*--------------------------------------------------------*/ 
  groupEntries() {
    const groupedByWeek: { [weekNumber: string]: any[] } = {};
    for (const entry of this.entries) {
      const entryDate = new Date(entry.timeEntry.startTime);
      const weekNumber = this.getWeekNumber(entryDate);
      if (!groupedByWeek[weekNumber]) {
        groupedByWeek[weekNumber] = [];
      }
      groupedByWeek[weekNumber].push(entry);
    }

    // Sort weeks from newer to older
    const sortedWeekNumbers = Object.keys(groupedByWeek).sort((a, b) => Number(b) - Number(a));

    this.groupedEntries = sortedWeekNumbers.map(weekNumber => {

      const weekEntries = groupedByWeek[weekNumber];
      const groupedByDay: { [day: string]: any[] } = {};

      for (const entry of weekEntries) {
        const day = entry.timeEntry.startTime.split('T')[0];
        if (!groupedByDay[day]) {
          groupedByDay[day] = [];
        }
        groupedByDay[day].push(entry);
      }

      // Sort days from newer to older
      const sortedDays = Object.keys(groupedByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const days = sortedDays.map(date => {
        const dayEntries = groupedByDay[date];
        console.log(dayEntries);

        // Grouping by description, assignmentId, and projectID within each day
        const groupedByTask : {[taskKey:string] : any} = {};
        for (const entry of dayEntries){
          const key=`${entry.timeEntry.description}-${entry.timeEntry.assignmentID}-${entry.timeEntry.projectID}`;
          console.log(key);
          if(!groupedByTask[key]){
            groupedByTask[key] = {
              ...entry,
              start : new Date(entry.timeEntry.startTime),
              end : new Date(entry.timeEntry.endTime),
              subentries : [entry] // including the main entry
            };
          }
          else {
            groupedByTask[key].subentries.push(entry);

            groupedByTask[key].start = new Date(Math.min(groupedByTask[key].start.getTime(), new Date(entry.timeEntry.startTime).getTime()));
            groupedByTask[key].end = new Date(Math.max(groupedByTask[key].end.getTime(), new Date(entry.timeEntry.endTime).getTime()));
          }
        }
        console.log("grouped by task : ", groupedByTask);

        const finalEntries = Object.values(groupedByTask).map(entry => {
           // Sort subentries with those without endTime first, and then from newer to older
           entry.subentries.sort((a: any, b: any) => {
              if (!a.timeEntry.endTime) return -1;
              if (!b.timeEntry.endTime) return 1;
              return new Date(b.timeEntry.endTime).getTime() - new Date(a.timeEntry.endTime).getTime();
           });

            const total = entry.subentries.reduce((sum: number, subEntry: any) => {
              return sum + subEntry.timeEntry.durationInMinutes;
            }, 0);
            const totalHours = Math.floor(total / 60);
            entry.minutes = total%60;
            entry.hours = totalHours;

          return entry;
        }).sort((a, b) => {
          if (!a.timeEntry.endTime) return -1;
          if (!b.timeEntry.endTime) return 1;
          return new Date(b.end).getTime() - new Date(a.end).getTime();
        });
        //console.log("Final entries ", finalEntries);
        const total = finalEntries.reduce((sum: number, entry: any) => {
          return sum + entry.hours*60 + entry.minutes
        }, 0);
        const totalHours = Math.floor(total / 60);
        const totalMinutes = total % 60;
        return {
          date,
          total,
          totalHours,
          totalMinutes,
          entries: finalEntries
        };
      });

      const total = days.reduce((weekSum: number, day: any) => {
        return weekSum + day.total;
      }, 0);

      const totalHours = Math.floor(total / 60);
      const totalMinutes = total % 60;

      return {
        weekNumber: parseInt(weekNumber, 10),
        totalHours,
        totalMinutes,
        days
      };
    });

    console.log('Grouped ', this.groupedEntries);
  }

  getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  toggleSubEntries(entry: any) {
    entry.showSubEntries = !entry.showSubEntries;
  }

  navigateToProject(entry : any){
    const projectNameWithDash = entry.projectName.replace(/\s+/g, '-');
    
    this.router.navigate(['/home', 
    entry.timeEntry.projectID, 
    '-',
    projectNameWithDash, 
    '-', 
    'view'
    ]);
  }

  navigateToTask(entry : any){
    const projectNameWithDash = entry.projectName.replace(/\s+/g, '-');
    const assignmentListNameWithDash = entry.assignmentListName.replace(/\s+/g, '-');
    const assignmentNameWithDash = entry.assignmentName.replace(/\s+/g, '-');

    this.router.navigate(['/home', 
      entry.timeEntry.projectID, 
      entry.assignmentListID, 
      projectNameWithDash, 
      assignmentListNameWithDash, 
      entry.timeEntry.assignmentID, 
      assignmentNameWithDash, 
      'taskpage'
    ]);
  }

  calculateSeconds(time1:Date,time2:Date){
    const differenceInMilliseconds = new Date(time2).getTime() - new Date(time1).getTime();
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    const seconds = differenceInSeconds % 60;
    return(seconds);
  }
}
