import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  constructor(private router : Router){};
  private getUrl(): string{
    const url = this.router.url;
    const lastIndex = url.lastIndexOf('/');
    const currentPage = url.substring(0,lastIndex);
    return currentPage;
  }
  onItemClick(page : string){
    const tempUrlString=this.getUrl();
      if(tempUrlString.includes('profile')==true)
      {
        const decodedString = tempUrlString.replace(/%20/g, ' ');
        const cleanedUrlString=page;
        this.router.navigate([cleanedUrlString]);
      }
      else {
        const urlString = this.getUrl() + page;
        const decodedString = urlString.replace(/%20/g, ' ');
        this.router.navigate([decodedString]);
      }
  }
}
