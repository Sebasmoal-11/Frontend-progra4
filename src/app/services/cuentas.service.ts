import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cuenta } from './auth';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private apiUrl = 'https://localhost:7245/Cuenta';

  constructor(private http: HttpClient) {}

  // Método para mapear datos de cuenta para la UI
  private mapearCuentaParaUI(cuenta: Cuenta): any {
    return {
      ...cuenta,
      // Para compatibilidad con el HTML
      numero: cuenta.numeroCuenta,
      tipo: cuenta.tipoCuenta,
      estado: cuenta.estadoCuenta,
      alias: cuenta.alias || `Cuenta ${cuenta.tipoCuenta}`,
      clienteNombre: cuenta.cliente?.nombreCompleto || 'N/A'
    };
  }

  getCuentasPorCliente(clienteId: number): Observable<any[]> {
    return this.http.get<Cuenta[]>(`${this.apiUrl}/PorCliente/${clienteId}`).pipe(
      catchError(error => {
        console.error('Error obteniendo cuentas:', error);
        return of([]);
      }),
      map((cuentas: Cuenta[]) => cuentas.map(c => this.mapearCuentaParaUI(c))) // ← Tipos explícitos
    );
  }

  getAllCuentas(): Observable<any[]> {
    return this.http.get<Cuenta[]>(`${this.apiUrl}`).pipe(
      catchError(error => {
        console.error('Error obteniendo todas las cuentas:', error);
        return of([]);
      }),
      map((cuentas: Cuenta[]) => cuentas.map(c => this.mapearCuentaParaUI(c))) // ← Tipos explícitos
    );
  }

  abrirCuenta(cuentaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, cuentaData).pipe(
      catchError(error => {
        console.error('Error abriendo cuenta:', error);
        throw error;
      })
    );
  }

  cambiarEstado(cuentaId: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cuentaId}/estado`, { estado }).pipe(
      catchError(error => {
        console.error('Error cambiando estado de cuenta:', error);
        throw error;
      })
    );
  }

  getCuentaPorNumero(numero: string): Observable<any> {
    return this.http.get<Cuenta>(`${this.apiUrl}/numero/${numero}`).pipe(
      catchError(error => {
        console.error('Error obteniendo cuenta:', error);
        throw error;
      }),
      map((cuenta: Cuenta) => this.mapearCuentaParaUI(cuenta)) // ← Tipos explícitos
    );
  }
  
  private getClienteId(): number | null {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        return usuario.clienteId || null;
      } catch {
        return null;
      }
    }
    return null;
  }
}