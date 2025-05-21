import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  constructor(public loaderService:LoaderService){
    /*
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        
        this.loaderService.isLoading.next(true);
        console.log("AAAAAAAAAAAAAAAAAAAAAAA");
      }
      if (ev instanceof NavigationEnd || ev instanceof NavigationCancel || ev instanceof NavigationError) {
        this.loaderService.isLoading.next(false);
        console.log("BBBBBBBBBBBBBBBBBB");
      }
    })
    */
  }
}
