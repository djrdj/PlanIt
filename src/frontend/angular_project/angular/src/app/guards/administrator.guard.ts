import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/user.services';



@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
	constructor(private router:Router, private route:ActivatedRoute,private apiService:ApiService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		
		const role = localStorage.getItem('userRoleName') as string;
		const isAuthenticated = this.apiService.isAuthenticated();
		if (!isAuthenticated || !(role === 'Administrator')) 
		{
			this.router.navigate([this.router.url]);
			return false;
		}

  		return true;
	 
	}
  
}