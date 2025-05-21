import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectCommunicationServiceService } from '../../services/project-communication-service.service';
import { Task_List_Communication_String } from '../../services/Task_List_Communication_String';
import { TranslateService } from '@ngx-translate/core'
import { TaskListCommunicationService } from '../../services/task-list-communication.service';
import { TaskListSubprojectCommunicationService } from '../../services/task-list-subproject-communication.service';
import e from 'express';
@Component({
  selector: 'app-urlnavigation',
  templateUrl: './urlnavigation.component.html',
  styleUrl: './urlnavigation.component.scss'
})
export class UrlnavigationComponent {
  ProjectName!:string;
  SubProjectName!:string;
  TaskName!:string;
  Id!: number;
  subId!:number;
  stringSubscription: Subscription | undefined;
  stringSubcription2: Subscription | undefined;
  selectedLanguage : string = "en";
  constructor(private router : Router,private TaskListStringCommunication: Task_List_Communication_String,private projectCommunicationService: ProjectCommunicationServiceService,private translateService:TranslateService,
    private taskListCommunicationService : TaskListCommunicationService, private taskListSubprojectCommunicationService : TaskListSubprojectCommunicationService
  ){}
  ngOnInit(): void {
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    this.getCurrentPageFromUrl(this.router.url.toString());
    this.stringSubscription = this.projectCommunicationService.string$.subscribe((str: string) => {
      this.ProjectName=str.replace( '-',' ');
      this.SubProjectName='-';
     
    });
  this.stringSubcription2= this.TaskListStringCommunication.string$.subscribe(({str,str2})=>{
     
      this.ProjectName = str2.replace( '-',' ');
      this.SubProjectName=str.replace( '-',' ');
  });

    const isDarkMode = localStorage.getItem('darkMode');
        
    if (isDarkMode) {
      const htmlElement = document.querySelector('.dark-mode');
      if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
    }
  }

  private getCurrentPageFromUrl(url: string): string {
    const parts = url.split('/');
    // Parsiraj poslednje delove URL-a
    this.ProjectName = decodeURIComponent(parts[4] || 'home').replace(/-/g, ' ');
    console.log('Projekat: ',this.ProjectName);
   
    this.SubProjectName = decodeURIComponent(parts[5]).replace(/-/g, ' ');;
    this.SubProjectName==undefined ? console.log('naziv Podprojekta',this.SubProjectName,"tip",typeof this.SubProjectName) : console.log('naziv Podprojekta',this.SubProjectName);
    this.TaskName= decodeURIComponent(parts[7] || 'home').replace(/-/g, ' ');
    this.Id=parseInt(parts[2] || 'home');
    this.subId=parseInt(parts[3] || 'home');
    return decodeURIComponent(parts[3] || 'home');
  }
  BackTooProjectOnly(){
    console.log("Projekat : ", this.ProjectName);
    
    this.SubProjectName = '-';
    this.router.navigate(['/home',this.Id,'-',this.ProjectName.replaceAll( ' ','-'),'-','view'])
    this.taskListCommunicationService.sendId(this.Id);
  }
  BackTooProject(){
    console.log("SubProjectName: ",this.SubProjectName.replaceAll(' ','-'));
    const parts = this.router.url.split('/')[3];
    const subId = (!isNaN(parseInt( parts, 10))) ? parseInt(parts, 10) : '-'; 
    this.router.navigate(['/home',this.Id, subId,this.ProjectName.replaceAll( ' ','-'),this.SubProjectName.replaceAll( ' ','-'),'view'])
    if (subId!='-') this.taskListSubprojectCommunicationService.sendId(subId);
    else this.taskListCommunicationService.sendId(this.Id);
  }
  
}
