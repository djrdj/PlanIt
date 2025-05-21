import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/user.services';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class EditProfileGuard implements CanActivate {
  constructor(private router: Router, private apiService: ApiService, private cookieService: CookieService) { }
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    
      if (!this.apiService.isAuthenticated()) {
        localStorage.removeItem("token")
        this.cookieService.delete("token");
        this.router.navigate(["signin"]);
        return false;
      }
  
     
      const role = localStorage.getItem('userRoleName');
      if (role === 'Administrator') {
        return true; 
      }
    

      const userId = next.params['userId'];
      const userIdFromLocalStorage = localStorage.getItem('id');

      if (userId !== userIdFromLocalStorage) {
        this.router.navigate(['home']);
        return false;
      }
  
      return true; 
    }

}
