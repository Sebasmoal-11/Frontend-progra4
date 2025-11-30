import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private api: ApiService, private router: Router) {
    this.checkToken();
  }

  // Login rápido - sin validaciones complejas
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response: any = await this.api.post('Autenticacion/login', {
        email: email,
        password: password
      }).toPromise();

      if (response.token) {
        localStorage.setItem('token', response.token);
        this.isAuthenticated.next(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  // Logout rápido
  logout() {
    localStorage.removeItem('token');
    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  // Verificar si hay token
  private checkToken() {
    const token = localStorage.getItem('token');
    this.isAuthenticated.next(!!token);
  }

  // Estado de autenticación
  getAuthStatus() {
    return this.isAuthenticated.asObservable();
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}