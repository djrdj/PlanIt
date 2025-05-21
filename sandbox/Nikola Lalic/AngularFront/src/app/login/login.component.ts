import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username?: string;
  password?: string;

  constructor(private apiService: ApiService, private router: Router) {}
  async onSubmit(): Promise<void> {
    if (this.username && this.password) {
      try {
        const response = await this.apiService.login(this.username, this.password).toPromise();
        this.router.navigate(['/index']);
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  }
}
