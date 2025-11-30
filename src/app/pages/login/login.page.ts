import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  credentials = {
    email: '',
    password: ''
  };
  
  loading = false;
  showError = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    this.loading = true;
    
    try {
      const success = await this.authService.login(
        this.credentials.email, 
        this.credentials.password
      );
      
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.showErrorAlert('Credenciales incorrectas');
      }
    } catch (error) {
      this.showErrorAlert('Error de conexión');
    } finally {
      this.loading = false;
    }
  }

  private showErrorAlert(message: string) {
    this.errorMessage = message;
    this.showError = true;
  }
}