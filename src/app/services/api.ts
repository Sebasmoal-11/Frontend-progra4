import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7245/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Headers con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Métodos HTTP con manejo de errores
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    console.error('Error en API:', error);
    
    if (error.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Sesión expirada. Por favor inicie sesión nuevamente.'));
    }
    
    if (error.status === 403) {
      return throwError(() => new Error('No tiene permisos para realizar esta acción.'));
    }
    
    if (error.status === 404) {
      return throwError(() => new Error('Recurso no encontrado.'));
    }
    
    if (error.status === 0) {
      return throwError(() => new Error('No se puede conectar al servidor. Verifique su conexión.'));
    }
    
    // Error del servidor
    const mensaje = error.error?.mensaje || error.error?.message || 'Error en el servidor';
    return throwError(() => new Error(mensaje));
  }
}