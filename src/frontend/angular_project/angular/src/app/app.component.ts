import { Component, HostListener, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/user.services';
import { SidebarService } from './services/sidebar.service';
import { DarkModeService } from './services/dark-mode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isDarkMode: boolean = false;
  title = 'angular';
  currentPage: string = 'home';
  isAuthenticated: boolean = false;
  isSidenavOpen: boolean = false;
  pageTitle: string = 'Projects Dashboard';
  id: number = 0;

  constructor(private router: Router, private authService : ApiService,  private sidebarService: SidebarService, private darkModeService : DarkModeService) { }

  @HostListener('document:keydown.control.alt.p', ['$event'])
  handleKeyboardEventHome(event: KeyboardEvent) {
    // Navigacija na "/home" putanju kada se pritisne Ctrl+Alt+P
    console.log('Ctrl+Alt+P pressed');
    this.router.navigateByUrl('/home');
    event.preventDefault(); // Ovo sprečava podrazumevanu akciju tasterske prečice, na primer otvaranje konzole u browser-u
  }

  @HostListener('document:keydown.control.alt.t', ['$event'])
  handleKeyboardEventTaskView(event: KeyboardEvent) {
    // Navigacija na "/view" putanju kada se pritisne Ctrl+Alt+T
    console.log('Ctrl+Alt+T pressed');
    this.router.navigateByUrl('/view');
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.k', ['$event'])
  handleKeyboardEventKanban(event: KeyboardEvent) {
    // Navigacija na "/kanban" putanju kada se pritisne Ctrl+Alt+K
    console.log('Ctrl+Alt+K pressed');
    this.router.navigateByUrl('/kanban');
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.g', ['$event'])
  handleKeyboardEventGantogram(event: KeyboardEvent) {
    // Navigacija na "/ganttchart" putanju kada se pritisne Ctrl+Alt+G
    console.log('Ctrl+Alt+G pressed');
    this.router.navigateByUrl('/ganttchart');
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.m', ['$event'])
  handleKeyboardEventSettings(event: KeyboardEvent) {
    // Navigacija na "/settings" putanju kada se pritisne Ctrl+Alt+M
    console.log('Ctrl+Alt+M pressed');
    this.router.navigateByUrl('/settings');
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.u', ['$event'])
  handleKeyboardEventUserProfile(event: KeyboardEvent) {
    // Navigacija na "/profile/id" putanju kada se pritisne Ctrl+Alt+U
    console.log('Ctrl+Alt+U pressed');
    this.router.navigateByUrl('/profile/'+this.id);
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.e', ['$event'])
  handleKeyboardEventEditProfile(event: KeyboardEvent) {
    // Navigacija na "/edit-profile/id" putanju kada se pritisne Ctrl+Alt+E
    console.log('Ctrl+Alt+E pressed');
    this.router.navigateByUrl('/edit-profile/'+this.id);
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.n', ['$event'])
  handleKeyboardEventNotifications(event: KeyboardEvent) {
    // Navigacija na "/notifications" putanju kada se pritisne Ctrl+Alt+N
    console.log('Ctrl+Alt+N pressed');
    this.router.navigateByUrl('/notifications');
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.s', ['$event'])
  handleKeyboardEventStatistics(event: KeyboardEvent) {
    // Navigacija na "/statistics" putanju kada se pritisne Ctrl+Alt+S
    console.log('Ctrl+Alt+S pressed');
    this.router.navigateByUrl('/statistics');
    event.preventDefault(); 
  }


  @HostListener('document:keydown.control.alt.d', ['$event'])
  handleKeyboardEventDarkModeToggle(event: KeyboardEvent) {
    // Toggle tamne teme kada se pritisne Ctrl+Alt+D
    console.log('Ctrl+Alt+D pressed');
    this.toggleDarkMode();
    event.preventDefault(); 
  }

  @HostListener('document:keydown.control.alt.c', ['$event'])
  handleKeyboardEventClockIT(event: KeyboardEvent) {
    // Navigacija na "/clockit" kada se pritisne Ctrl+Alt+C
    console.log('Ctrl+Alt+C pressed');
    this.router.navigateByUrl('/clockit');
    event.preventDefault(); 
  }

  toggleDarkMode() {
    const currentUrl = this.router.url;
    this.darkModeService.toggleDarkMode(this.id).subscribe(() => {
      // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      //   this.router.navigate([currentUrl]);
      // });
      window.location.reload();
    });
  }

  ngOnInit() {
    this.id = Number(localStorage.getItem("id"));//id za precice

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        
        this.currentPage = this.getCurrentPageFromUrl(event.url);

        if (this.currentPage == 'view') this.pageTitle = 'Task Dashboard';
        else if (this.currentPage == 'profile') this.pageTitle = 'Profile page';
        else if (this.currentPage == 'edit-profile') this.pageTitle = 'Edit profile';
        else if (this.currentPage == 'ganttchart') this.pageTitle = 'Gantt chart';
        else if (this.currentPage == 'kanban') this.pageTitle = 'Kanban';
        else if (this.currentPage == 'home' && localStorage.getItem("userRoleName")=='Administrator') this.pageTitle = 'All Users';
        else if (this.currentPage == 'settings') this.pageTitle = 'Settings';
        else this.pageTitle = 'Projects Dashboard'; 
        this.isAuthenticated = this.authService.isAuthenticated();
      }
    });

    this.isAuthenticated = this.authService.isAuthenticated();


    // Subscribe to changes in local storage
    this.sidebarService.isSidenavOpen$.subscribe(isOpen => {
      this.isSidenavOpen = isOpen;
    });
    this.isSidenavOpen = this.sidebarService.getIsSidenavOpen();

    // Subscribe to dark mode changes
    this.darkModeService.darkModeSubject.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      document.querySelector('.app-sidebar')?.classList.toggle('dark', JSON.parse(isDarkMode.toString()));
      document.querySelector('.app-layout')?.classList.toggle('dark', JSON.parse(isDarkMode.toString()));
      document.querySelector('.content')?.classList.toggle('dark', JSON.parse(isDarkMode.toString()));
    });

  }

  private getCurrentPageFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'home';
  }

}
