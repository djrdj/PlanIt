import { Component } from '@angular/core';
import { CommentsCountByDate, StatisticsService, StatusProgress } from '../../services/statistics.service';
import { Router } from '@angular/router';
import { parse } from 'path';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';
import { Subscription } from 'rxjs';
import { TaskListCommunicationService } from '../../services/task-list-communication.service';
import { TaskListAllTasksCommunicationService } from '../../services/task-list-all-tasks-communication.service';
import { display } from 'html2canvas/dist/types/css/property-descriptors/display';
import { ProjectCommunicationServiceService } from '../../services/project-communication-service.service';
import { Task_List_Communication_String } from '../../services/Task_List_Communication_String';
import { TaskListSubprojectCommunicationService } from '../../services/task-list-subproject-communication.service';
import { Chart } from 'chart.js';
import { color } from 'html2canvas/dist/types/css/types/color';
import { TranslateService } from '@ngx-translate/core'
import { ClockitService } from '../../services/clockit.service';
import { ProjectdashboardService } from '../../services/projectdashboard.service';
import { Project } from '../../models/project';
@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss'
})
export class StatisticComponent {
  data1 : any;
  options1 : any;
  data2 : any;
  data3 : any;
  optionsBar : any;
  optionsBarTasks : any;
  users: any[] = [];
  users2: any[] = [];
  mostEngaged : any = null;
  selectedProject !: number;
  selectedSubProject : number =0;
  selectedDateRange: string = 'last7days'; // Default selected date range
  selectedDateRange2: string = 'last7days'; // Default selected date range
  commentsData: { [date: string]: number }  = {};
  statusCounts : StatusProgress = {}; 
  urgentTasks : number = 0;
  members : number = 0;
  postojiMostEngaged : boolean = true;


  stringSubscription: Subscription | undefined;
  stringSubcription2: Subscription | undefined;
  IdSubscription: Subscription | undefined;
  IdSub: Subscription | undefined;

  timeChartData: any;

  projects !: Project[];

  chart : any;
  selectedLanguage : string = "en";
  constructor(private router: Router, private statisticsService: StatisticsService, private taskListComunicationService: TaskListCommunicationService, 
              private taskListAllTasksCommunicationService : TaskListAllTasksCommunicationService,
              private projectCommunicationService: ProjectCommunicationServiceService,
              private TaskListStringCommunication : Task_List_Communication_String,
              private clockItService : ClockitService,
              private projectdasboardService : ProjectdashboardService,
            private taskListSubprojectCommunicationService : TaskListSubprojectCommunicationService,private translateService:TranslateService) {}

  ngOnInit(): void 
  {
    this.selectedProject = 0;
    const isDarkMode = localStorage.getItem('darkMode');
      
    if (isDarkMode!=null){
      const htmlElement = document.querySelector('.statistic-page');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }

    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    const projectFromUrl = parseInt(this.router.url.split('/')[2], 10);
    const subprojectFromUrl = parseInt(this.router.url.split('/')[3], 10);
    
    console.log("Project from URL : ", projectFromUrl);
    console.log("Subproject from URL : ", subprojectFromUrl);

    this.selectedProject = (projectFromUrl == 0 || isNaN(projectFromUrl))? 1 : projectFromUrl; // TO DO : proveriti dal postoji, ako ne onda Svi projekti
    this.selectedSubProject = (subprojectFromUrl == 0 || isNaN(subprojectFromUrl))? 0 : subprojectFromUrl;

    this.IdSubscription= this.taskListComunicationService.number$.subscribe((Id) =>
    {
        this.selectedProject = Id != 0? Id : 1;
        this.selectedSubProject = 0;

        console.log("Project  : ", this.selectedProject );
        console.log("Subproject : ", this.selectedSubProject);
        this.getEverything();
    });

    this.IdSub= this.taskListSubprojectCommunicationService.number$.subscribe((Id)=>
    {
        this.selectedSubProject = Id;
     
        const projectFromUrl = parseInt(this.router.url.split('/')[2], 10);
        this.selectedProject = projectFromUrl;

        console.log("Project  : ", this.selectedProject );
        console.log("Subproject : ", this.selectedSubProject);
        this.getEverything();

    });

    this.taskListAllTasksCommunicationService.signal$.subscribe(() => {
        this.selectedProject = 1;
        this.selectedSubProject = 0;
        
        console.log("Project  : ", this.selectedProject );
        console.log("Subproject : ", this.selectedSubProject);
        this.getEverything();
    });

    console.log(this.selectedProject);

    //this.getEverything();
    // -------------------------------------------------------------------------------------------------
   
    /* ---------------------- OPTIONS PIE CHART ------------------- */
    this.options1 = {
      responsive: true,
      plugins: { 
        legend: { 
          position: 'left',
          labels: { 
            usePointStyle: true,
            boxWidth: 17,
            boxHeight: 15,
            color: (isDarkMode!='1')? "#495057" : "#FFFFFF",
          }, 
        }, 
      }, 
    };
    
    /* --------------------- OPTIONS BAR CHART ------------------- */
    this.optionsBar = {
      scales: {
        x :{
          ticks :{
            color: 'rgb(156 163 175)'
          }
        },
        y :{
          ticks:{
            color: 'rgb(156 163 175)',
            stepSize: 2
          }
        },
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      plugins: { 
        legend: {
          labels: {
            usePointStyle: true,
            color: (isDarkMode!='1')? "#495057" : "#FFFFFF"
          }
        },
      },
      responsive: true,
      maintainAspectRatio: false
    };

     /* --------------------- OPTIONS BAR CHART 2 ------------------- */
    this.optionsBarTasks = {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        x :{
          ticks :{
            color: 'rgb(156 163 175)'
          }
        },
        y :{
          ticks:{
            color: 'rgb(156 163 175)',
            stepSize: 1
          }
        }
       
      },
      plugins:{
        legend: {display: false}
      },
      responsive: true,
      maintainAspectRatio: false
    };
    this.getProjects();
  }
  getDataForLast30Days() {
    // Call your service method to fetch data for the last 30 days
    this.clockItService.getTotalForProjectByDate(this.selectedProject).subscribe(data => {
        // Process data and set it for the bar chart
        this.timeChartData = {
            labels: data.map(entry => {
              const parsedDate = new Date(entry.date);
              return parsedDate.toDateString(); // Format date as desired
            }), // Assuming each data entry has a 'date' property
            datasets: [
                {
                    label: 'Total Time (hours)',
                    data: data.map(entry => {
                      const totalHours = entry.totalDurationInMinutes / 60;
                      return totalHours.toFixed(2);
                    }), // Assuming each data entry has a 'totalDurationInMinutes' property
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };
    });
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
    
    this.getEverything();
     
  }
  getEverything()
  {
    this.mostEngaged = null;
    this.getDataForLast30Days(); // Initial data retrieval
    this.getUserWithMostComments();                       // ima za subprojete
    this.getWorkload();                                   // ima za subprojete
    this.getTaskCompletionRate();                         // ima 
    this.getTeamEngagement();                             // ima za subprojete
    this.getNumberOfTasksPerStatuses();                   // ima
    this.getUniqueUsers();                                // ima za subprojekte
    this.getHighPriorityTasks();                          // ima za subprojete
    this.getUsersOnProjectWithCompletedTaskCount();       // ima za subprojete
  }

  /* ------------------------------------- GET USER WITH MOST COMMENTS ------------------------------*/
  getUserWithMostComments()
  {
    console.log("get user with most comments");
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getUserWithMostComments(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getUserWithMostComments(this.selectedProject);

    observable.subscribe({
      next: (user: any) => 
        {
          console.log(user);
          this.mostEngaged = user;
          this.postojiMostEngaged = true;
        },
      error : (error: any) => 
        {
          this.postojiMostEngaged = false;
          console.error('Error fetching most engaged user:', error);
        }
      });
  }

  /* ------------------------------------- GET USER WITH TASK WORKLOAD  ------------------------------*/
  getWorkload()
  {
    console.log("get workload");
    const observable = this.selectedSubProject !== 0 ? 
    this.statisticsService.getUsersOnProjectWithTaskCount(this.selectedProject, this.selectedSubProject) :
    this.statisticsService.getUsersOnProjectWithTaskCount(this.selectedProject);

    observable.subscribe({
      next: (res: any) => 
        {
          this.users = res;
        },
      error : (error: any) => 
        {
          console.error('Error fetching users with task workload:', error);
        }
      });
  }

  /* ------------------------------------- TASK COMPLETION RATE  ------------------------------*/
  getTaskCompletionRate()
  {
    console.log("get task completion rate");
    const backgroundColors = (localStorage.getItem('darkMode') == '1')?  ['#36A2EB', '#FFCE56', 'rgb(156 163 175)', '#FF6384', '#4BC0C0', '#9966FF'] :
    ['#36A2EB', '#FFCE56', '#CCCCCC', '#FF6384', '#4BC0C0', '#9966FF'];
    
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getProgressByStatuses(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getProgressByStatuses(this.selectedProject);

    observable.subscribe({
      next: (res: any) => 
        {
          console.log("RES:" ,res);
          const statuses1: string[] = Object.keys(res);
          const statuses: string[] = ["In progress", "Planned"];
          const values: number[] = statuses1.map(status1 => res[status1]);

          const allZeros = values.every(value => value === 0);
          const sum = values.reduce((acc, cur) => acc + cur, 0);
          const notCompletedValue = 100 - sum;
          statuses.push('Not completed');
          values.push(notCompletedValue);
          // if (allZeros) {
          //   this.data1 = {
          //     labels: ['Not completed'],
          //     datasets: [{
          //       data: [1], // Assuming a single segment with value 1 to represent "No Data"
          //       backgroundColor: ['#CCCCCC'] // Grey color for "No Data" segment
          //     }]
          //   };
          // } 
          // else
          // {
            const dynamicBackgroundColors = statuses.map((status, index) => {
              // Use modulo operator to cycle through the predefined colors
              return backgroundColors[index % backgroundColors.length];
            });

            this.data1 = {
              labels: statuses,
              datasets: [
                {
                  borderWidth: 0,
                  data: values,
                  backgroundColor: dynamicBackgroundColors
                }
              ]
            };

            //this.makeChart();
         // }
        },
      error : (error: any) => 
        {
          console.error('Error fetching users with task workload:', error);
        }
      });
  }
  // makeChart()
  // {
  //   this.chart = new Chart('canvas', {
  //     type: 'doughnut',
  //     data: this.data1,
  //     options: {
  //       responsive: true,
  //       plugins: { 
  //         legend: { 
  //           position: 'left',
  //           labels: { 
  //             usePointStyle: true,
  //             boxWidth: 17,
  //             boxHeight: 15,
  //             color: "#495057",
  //           }, 
  //         }, 
  //       }, 
  //     },
  //     plugins: [
  //       {
  //         id: 'text',
  //         beforeDraw: function (chart, a, b) {
  //           var width = chart.width,
  //             //height = chart.height,
  //             ctx = chart.ctx;

  //           ctx.restore();
  //           var fontSize = (height / 114).toFixed(2);
  //           ctx.font = fontSize + 'em sans-serif';
  //           ctx.textBaseline = 'middle';

  //           var text = '75%',
  //             textX = Math.round((width - ctx.measureText(text).width) / 2 + width/6),
  //             textY = height / 2;

  //           ctx.fillText(text, textX, textY);
  //           ctx.save();
  //         },
  //       },
  //     ],
  //   });
  // }
  /* --------------------------------------- TEAM ENGAGEMENT ----------------------------- */
  getTeamEngagement()
  {
    console.log("get team engagemenet");
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getCommentsCountByDate(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getCommentsCountByDate(this.selectedProject);

    observable.subscribe({
        next: (res: CommentsCountByDate) => 
          {
            //console.log(res);
            

            const labels: string[] = [];
            const data: number[] = [];
            
            for (const date in res) {
              if (res.hasOwnProperty(date)) {
                const count = res[date];
                const parsedDate = new Date(date); 
                const formattedDate = parsedDate.toISOString().slice(0, 10); 
                this.commentsData[formattedDate] = count;
              }
            }
          // console.log(this.commentsData);

            if (this.selectedDateRange == 'all')
            {
                for (const date in res) {
                  if (res.hasOwnProperty(date)) {
                    const count = res[date];
                    const parsedDate = new Date(date); // Parse date string into Date object
                    labels.push(parsedDate.toDateString()); // Convert Date object to string representation
                    data.push(count);
                  }
                }
            }  
            /*----------------  Ovo je ako hocemo u zadnjih 7 ili 30 dana  ---------------- */
            else 
            {
              var days = 0;
              if (this.selectedDateRange == 'last7days') days = 6;
              else days = 29;
            
              const today = new Date();
              let referenceDate = new Date();
              referenceDate.setDate(today.getDate() - days);

              while (referenceDate <= today) {
                const dateString = referenceDate.toISOString().slice(0, 10); // Get YYYY-MM-DD format
                //console.log(dateString);
                const count = this.commentsData[dateString] || 0; // Use count from response, or default to 0
                labels.push(referenceDate.toDateString()); // Convert Date object to string representation
                data.push(count);

                // Move to the next date
                referenceDate.setDate(referenceDate.getDate() + 1);
              }
            }

            this.data2 = {
              labels: labels,
              datasets: [
                {
                  label: 'Comments Count',
                  data: data,
                  backgroundColor: '#36A2EB' // Sample color
                }
              ]
            };
            
          },
        error : (error: any) => 
          {
            console.error('Error fetching users with task workload:', error);
          }
        });

  }

  /* ------------------------------------- NUMBER OF TASKS PER STATUSES  ------------------------------*/
  getNumberOfTasksPerStatuses()
  {
    console.log("get number of tasks per statuses");
    const backgroundColors = ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0', '#9966FF'];
    
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getTaskCountsByStatus(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getTaskCountsByStatus(this.selectedProject);

    observable.subscribe({
      next: (res: StatusProgress) => 
        {

          const statuses: string[] = Object.keys(res);
          const values: number[] = statuses.map(status => res[status]);

          // const dynamicBackgroundColors = statuses.map((status, index) => {
          //   return backgroundColors[index % backgroundColors.length];
          // });

          this.statusCounts = res;

          this.data3 = {
            labels: statuses,
            datasets: [
              {
                data: values,
                //backgroundColor: dynamicBackgroundColors
                backgroundColor : '#36A2EB'
              }
            ]
          };

          console.log(this.data3);
        },
      error : (error: any) => 
        {
          console.error('Error fetching users with task workload:', error);
        }
      });
  }

  getUniqueUsers()
  {
    console.log("get unique users");
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getUniqueUsers(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getUniqueUsers(this.selectedProject);

    observable.subscribe({
      next: (res: any) => 
        {
          this.members = res;
        },
      error : (error: any) => 
        {
          console.error('Error fetching most engaged user:', error);
        }
      });
  }

  getHighPriorityTasks()
  {
    console.log("get high prioriry tasks");
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getHighPriorityTasks(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getHighPriorityTasks(this.selectedProject);

    observable.subscribe({
      next: (res: any) => 
        {
          this.urgentTasks = res;
        },
      error : (error: any) => 
        {
          console.error('Error fetching most engaged user:', error);
        }
      });
  }

  getUsersOnProjectWithCompletedTaskCount()
  {
    console.log("get users on project with completed task count");
    const observable = this.selectedSubProject !== 0 ? 
      this.statisticsService.getUsersOnProjectWithCompletedTaskCount(this.selectedProject, this.selectedSubProject) :
      this.statisticsService.getUsersOnProjectWithCompletedTaskCount(this.selectedProject);

    observable.subscribe({
      next: (res: any) => 
        {
          this.users2 = res;
        },
      error : (error: any) => 
        {
          console.error('Error fetching users with task workload:', error);
        }
      });
  }

  /* ------------------------------------- IMAGE REDIRECT ------------------------------ */
  imageRedirect(userId: number | undefined){
    this.router.navigate(['/profile/',userId]);
  }


  onDateRangeChange(event: any) {
    const selectedValue =  (event.target as HTMLSelectElement).value; 
    this.selectedDateRange = selectedValue;
    console.log("Selektovano : ",this.selectedDateRange);
    this.getTeamEngagement(); // Call getTeamEngagement() to fetch data for the selected range
  }
  onDateRangeChange2(event: any) {
    const selectedValue =  (event.target as HTMLSelectElement).value; 
    this.selectedDateRange2 = selectedValue;
    console.log("Selektovano : ",this.selectedDateRange);
    this.getDataForLast30Days(); // Call getTeamEngagement() to fetch data for the selected range
  }
}
