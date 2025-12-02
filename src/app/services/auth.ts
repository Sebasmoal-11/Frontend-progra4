// src/app/services/auth.service.ts - VERSIÓN COMPLETA BD REAL
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface Usuario {
  usuarioId: number;
  email: string;
  rol: string;
  nombreCompleto?: string;
  clienteId?: number;
  token?: string;
}

export interface Cuenta {
  cuentaId: number;
  numeroCuenta: string;  
  tipoCuenta: number;  
  moneda: number;
  saldo: number;
  estadoCuenta: number;
  clienteId: number;
  alias?: string;
  fechaApertura?: string;
  cliente?: {
    nombreCompleto?: string;
    email?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Cliente {
  clienteId: number;
  nombreCompleto: string;
  email: string;
  identificacion: string;
  telefono: string;
  usuarioId?: number;
  correo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  authStatus = this.isAuthenticated.asObservable();
  private apiUrl = 'https://localhost:7245/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

// ==================== LOGIN ====================
async login(email: string, password: string): Promise<boolean> {
  console.log('Iniciando sesión para:', email);

  try {
    // 1. Hacer login al backend
    const loginData: LoginRequest = { email, password };

    const response = await this.http.post<LoginResponse>(
      `${this.apiUrl}/Autenticacion/login`,
      loginData
    ).toPromise();

    if (!response || !response.token) {
      console.error('No se recibió token en la respuesta');
      return false;
    }

    console.log('Token JWT recibido correctamente');

    // 2. Guardar token en localStorage
    localStorage.setItem('token', response.token);
    
    // 3. Extraer datos del usuario del token JWT
    const usuario = this.extractUserFromToken(response.token, email);

    // 4. OBTENER CLIENTE ID DEL BACKEND (NUEVO)
    await this.asignarClienteId(usuario);

    // 5. Guardar usuario en localStorage
    localStorage.setItem('usuario', JSON.stringify(usuario));

    // 6. Actualizar estado de autenticación
    this.isAuthenticated.next(true);

    // 7. Redirigir al dashboard
    this.router.navigate(['/dashboard']);

    return true;

  } catch (error: any) {
    console.error('Error en login:', error);

    // Manejo específico de errores HTTP
    if (error.status === 401) {
      console.error('Credenciales incorrectas');
    } else if (error.status === 0) {
      console.error('No se puede conectar al servidor. Verifique que el backend esté corriendo.');
    } else if (error.status === 404) {
      console.error('Endpoint no encontrado. Verifique la URL.');
    }

    return false;
  }
}

// Método para obtener clienteId 
private async asignarClienteId(usuario: any): Promise<void> {
  try {
    const clientes = await this.http.get<any[]>('https://localhost:7245/Cliente').toPromise();
    
    // Verificar si se obtuvieron clientes
    if (!clientes) {
      console.log('No se obtuvieron clientes del backend');
      return;
    }
    
    // Convertir usuarioId a número si es string
    const usuarioIdNum = typeof usuario.usuarioId === 'string' 
      ? parseInt(usuario.usuarioId) 
      : usuario.usuarioId;
    
    // Buscar cliente por usuarioId
    let cliente = clientes.find(c => c.usuarioId === usuarioIdNum);
    
    // Si no se encuentra, buscar por email
    if (!cliente) {
      cliente = clientes.find(c => c.correo === usuario.email);
    }
    
    if (cliente) {
      usuario.clienteId = cliente.clienteId;
      usuario.nombreCompleto = cliente.nombreCompleto;
      console.log('Cliente asignado al usuario:', usuario);
    } else {
      console.log('No se encontró cliente para el usuario:', usuario.email);
      // Si es admin/gestor, no es necesario tener clienteId
      if (usuario.rol !== 'Administrador' && usuario.rol !== 'Gestor') {
        console.warn('Usuario cliente sin registro en tabla Clientes');
      }
    }
  } catch (error) {
    console.error('Error obteniendo clienteId:', error);
  }
}

   // ==================== MÉTODOS PRIVADOS PARA MANEJO DE JWT ====================
  
  /**
   * Extrae la información del usuario del token JWT
   */
  private extractUserFromToken(token: string, email: string): Usuario {
    try {
      // Decodificar el payload del JWT
      const payload = this.decodeJwtPayload(token);
      
      // Crear objeto usuario con los datos del token
      const usuario: Usuario = {
        usuarioId: payload.UsuarioId || parseInt(payload.UsuarioId) || 0,
        email: payload.Email || email,
        rol: this.extractRoleFromToken(payload)
      };
      
      console.log('Usuario extraído del token:', usuario);
      return usuario;
      
    } catch (error) {
      console.error('Error extrayendo usuario del token:', error);
      
      // Si falla la extracción, crear usuario mínimo para desarrollo
      return {
        usuarioId: 1,
        email: email,
        rol: 'Administrador'
      };
    }
  }

  /**
   * Decodifica el payload de un token JWT
   */
  private decodeJwtPayload(token: string): any {
    try {
      // El token JWT tiene formato: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT con formato incorrecto');
      }
      
      const payloadBase64 = parts[1];
      
      // Decodificar base64 (manejar caracteres URL-safe)
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(base64);
      
      return JSON.parse(payloadJson);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      throw new Error('Token JWT inválido');
    }
  }

  /**
   * Extrae el rol del usuario del payload del token
   */
  private extractRoleFromToken(payload: any): string {
    // En .NET, el rol puede venir en diferentes propiedades
    const possibleRolePaths = [
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], // Claim estándar de .NET
      payload.role,
      payload.Role,
      payload.rol,
      payload.Rol,
      payload['Role']
    ];
    
    // Buscar el primer valor que exista
    for (const role of possibleRolePaths) {
      if (role) {
        console.log(`Rol encontrado en claim: ${role}`);
        return role;
      }
    }
    
    console.warn('No se encontró rol en el token, usando valor por defecto');
    return 'Cliente'; // Valor por defecto
  }

  // ==================== MÉTODOS PARA OBTENER DATOS DE BD ====================

  /**
   * Obtener todos los clientes (para admin)
   */
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>('https://localhost:7245/Cliente').pipe(
    catchError(error => {
      console.error('Error obteniendo clientes:', error);
      return of([]);
      })
    );
  }

  /**
   * Obtener todas las cuentas (para admin/gestor)
   */
  getAllCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.apiUrl}/Cuenta`).pipe(
      catchError(error => {
        console.error('Error obteniendo todas las cuentas:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener cuentas por cliente ID
   */
  getCuentasPorCliente(clienteId: number): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.apiUrl}/Cuenta/PorCliente/${clienteId}`).pipe(
      catchError(error => {
        console.error('Error obteniendo cuentas del cliente:', error);
        return of([]);
      })
    );
  }

  /**
   * Abrir nueva cuenta
   */
  abrirCuenta(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Cuenta`, datos).pipe(
      catchError(error => {
        console.error('Error abriendo cuenta:', error);
        throw error;
      })
    );
  }

  /**
   * Cambiar estado de cuenta
   */
  cambiarEstadoCuenta(cuentaId: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/Cuenta/${cuentaId}/estado`, { estado }).pipe(
      catchError(error => {
        console.error('Error cambiando estado de cuenta:', error);
        throw error;
      })
    );
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private redirectByRole(rol: string): void {
    setTimeout(() => {
      switch (rol.toUpperCase()) {
        case 'ADMINISTRADOR':
          this.router.navigate(['/admin-dashboard']);
          break;
        case 'GESTOR':
          this.router.navigate(['/gestor-dashboard']);
          break;
        case 'CLIENTE':
        default:
          this.router.navigate(['/dashboard']);
      }
    }, 500);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  checkAuthStatus(): boolean {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    this.isAuthenticated.next(isAuth);
    return isAuth;
  }

  getCurrentUser(): Usuario | null {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return null;
    try {
      return JSON.parse(usuarioStr);
    } catch {
      return null;
    }
  }

  getUserCuentas(): Cuenta[] {
    const cuentasStr = localStorage.getItem('cuentas');
    if (!cuentasStr) return [];
    try {
      return JSON.parse(cuentasStr);
    } catch {
      return [];
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  getUserRole(): string {
    const usuario = this.getCurrentUser();
    return usuario?.rol || '';
  }

  getClienteId(): number | null {
    const usuario = this.getCurrentUser();
    return usuario?.clienteId || null;
  }
}