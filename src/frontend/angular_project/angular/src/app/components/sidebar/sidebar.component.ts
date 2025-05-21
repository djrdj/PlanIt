import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SidebarService } from '../../services/sidebar.service';
import { NotificationsService } from '../../services/notification.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { TranslateService } from '@ngx-translate/core'
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  @Input() role!: string;
  //isSidenavOpen: boolean = false;
  @Input() currentPage: string = '';
  isDarkMode : boolean = false;
  isSidenavOpen: boolean = false; 
  showText : boolean = false;
  selectedLanguage : string = "en";
  isProjectUrl: boolean = false;
  constructor(private cookie: CookieService, private router: Router, private sidebarService : SidebarService, public notificationService:NotificationsService,
    private darkModeService : DarkModeService,private translateService:TranslateService
  ) {}

  ngOnInit(): void {
    this.role=localStorage.getItem('userRoleName') as string;
    this.notificationService.createHubConnection();
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
    this.translateService.use(this.selectedLanguage);
    if (typeof localStorage !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode');
      
      if (isDarkMode) {
        this.isDarkMode = JSON.parse(isDarkMode);
        const htmlElement = document.querySelector('#layout');
        if (htmlElement) htmlElement.classList.toggle('dark', JSON.parse(isDarkMode));
      }
    }
    console.log(this.currentPage);
    
    this.isSidenavOpen = this.sidebarService.getIsSidenavOpen();

    // Subscribe to dark mode changes
    this.darkModeService.darkModeSubject.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      document.querySelector('#layout')?.classList.toggle('dark', JSON.parse(isDarkMode.toString()));
    });

    this.checkIfProjectUrl();
    this.router.events.subscribe(() => {
      this.checkIfProjectUrl();
    });
  }

  checkIfProjectUrl(): void {
    const url = this.router.url;
    const urlSegments = url.split('/');
    this.isProjectUrl = urlSegments.length > 5 && urlSegments[4] !== '-';
  }
  
  onDarkModeToggled(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
    
    const htmlElement = document.querySelector('#layout');
    if (htmlElement) htmlElement.classList.toggle('dark', isDarkMode);
    
  }
  toggleSidenav() 
  {
    this.isSidenavOpen = !this.isSidenavOpen;
    this.sidebarService.setIsSidenavOpen(this.isSidenavOpen);
  }

  mouseEnterFunction() {
    this.showText = true;
  }

  mouseLeaveFunction() {
    this.showText = false;
  }
  
  // onLogoff() {
  //   this.cookie.delete('token');
  //   localStorage.clear();
  //   this.router.navigateByUrl('/signin');
  // }

  private getUrl(): string{
    const currentPage = this.getCurrentPageFromUrl(this.router.url);
    console.log(currentPage);
   
      return currentPage;
     
  }
  onItemClick(page : string){
/*
    if (page == '/statistics')
    {
      const urlSegments = this.router.url;
      const splitted = urlSegments.split('/');
      console.log(splitted.length);
      let nextUrl = '';

      if (splitted.length == 2) nextUrl = `/home/-/statistics`;
      else nextUrl = `/home/${splitted[2]}/statistics`;
      
      console.log(nextUrl);
      this.router.navigate([nextUrl]);
    }
    else 
    {*/
    if (page == '/clockit')
      {
        this.router.navigate(['clockit']);
        
      }
    const tempUrlString=this.getUrl();
      if(tempUrlString.includes('profile')==true)
      {
        const decodedString = tempUrlString.replace(/%20/g, ' ');

        // Uklanjamo 'profile' iz dekodiranog stringa
      
        // Navigiramo na novi URL koristeći Angular Router
      
        const cleanedUrlString=page;
        this.router.navigate([cleanedUrlString]);
      }
      else {
        const urlString = this.getUrl() + page;
        const decodedString = urlString.replace(/%20/g, ' ');
        this.router.navigate([decodedString]);
      }
      
     
     
    // }
  }
  private getCurrentPageFromUrl(url: string) : string{
    // Get the current URL
  const url2 = this.router.url;
  
  // Find the index of the last '/'
  const lastIndex = url.lastIndexOf('/');

  // Extract the URL without the last part
  const updatedUrl = url.substring(0,lastIndex);

  return updatedUrl;
  }

}
