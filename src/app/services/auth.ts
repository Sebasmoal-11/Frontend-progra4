// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface Usuario {
  id: number;
  email: string;
  password: string;
  nombre: string;
  rol: string;
  identificacion: string;
  telefono: string;
  fechaRegistro: string;
  cuentas: Cuenta[];
  beneficiarios: Beneficiario[];
}

export interface Cuenta {
  id: string;
  numero: string;
  tipo: string;
  moneda: string;
  saldo: number;
  alias: string;
}

export interface Beneficiario {
  id: number;
  nombre: string;
  cuenta: string;
  banco: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  authStatus = this.isAuthenticated.asObservable();

  // USUARIOS LOCALES COMPLETOS
  private usuariosLocales: Usuario[] = [
    {
      id: 1,
      email: 'admin@banco.com',
      password: 'admin123',
      nombre: 'Administrador Sistema',
      rol: 'Administrador',
      identificacion: '101110111',
      telefono: '8888-8888',
      fechaRegistro: '2024-01-01',
      cuentas: [
        {
          id: '001-123456-1',
          numero: '1234567890',
          tipo: 'Ahorros',
          moneda: 'CRC',
          saldo: 1250000,
          alias: 'Cuenta Principal'
        },
        {
          id: '001-123456-2',
          numero: '0987654321',
          tipo: 'Corriente',
          moneda: 'USD',
          saldo: 15000,
          alias: 'Cuenta Dólares'
        }
      ],
      beneficiarios: [
        { id: 1, nombre: 'María López', cuenta: '002-987654-1', banco: 'BAC' },
        { id: 2, nombre: 'Carlos Rojas', cuenta: '001-555555-1', banco: 'BCR' }
      ]
    },
    {
      id: 2,
      email: 'cliente@banco.com',
      password: 'cliente123',
      nombre: 'Juan Carlos Pérez',
      rol: 'Cliente',
      identificacion: '202220222',
      telefono: '8881-1111',
      fechaRegistro: '2024-02-15',
      cuentas: [
        {
          id: '001-654321-1',
          numero: '6543210987',
          tipo: 'Ahorros',
          moneda: 'CRC',
          saldo: 750000,
          alias: 'Ahorro Navidad'
        },
        {
          id: '001-654321-2',
          numero: '1122334455',
          tipo: 'Corriente',
          moneda: 'CRC',
          saldo: 250000,
          alias: 'Cuenta Diaria'
        }
      ],
      beneficiarios: [
        { id: 1, nombre: 'Ana Martínez', cuenta: '001-444444-1', banco: 'BN' },
        { id: 2, nombre: 'Roberto Solís', cuenta: '002-777777-2', banco: 'BAC' }
      ]
    },
    {
      id: 3,
      email: 'gestor@banco.com',
      password: 'gestor123',
      nombre: 'María Rodríguez',
      rol: 'Gestor',
      identificacion: '303330333',
      telefono: '8882-2222',
      fechaRegistro: '2024-03-10',
      cuentas: [
        {
          id: '001-999999-1',
          numero: '9999999999',
          tipo: 'Ahorros',
          moneda: 'CRC',
          saldo: 2000000,
          alias: 'Fondo Emergencia'
        }
      ],
      beneficiarios: [
        { id: 1, nombre: 'Sofía Vargas', cuenta: '001-888888-3', banco: 'BCR' }
      ]
    },
    {
      id: 4,
      email: 'test@test.com',
      password: 'test123',
      nombre: 'Usuario de Prueba',
      rol: 'Cliente',
      identificacion: '404440444',
      telefono: '8883-3333',
      fechaRegistro: '2024-04-01',
      cuentas: [
        {
          id: '001-888888-1',
          numero: '8888888888',
          tipo: 'Ahorros',
          moneda: 'CRC',
          saldo: 500000,
          alias: 'Cuenta Estudiante'
        },
        {
          id: '001-888888-2',
          numero: '7777777777',
          tipo: 'Corriente',
          moneda: 'USD',
          saldo: 5000,
          alias: 'Ahorro USD'
        }
      ],
      beneficiarios: [
        { id: 1, nombre: 'Pedro González', cuenta: '001-333333-4', banco: 'BN' },
        { id: 2, nombre: 'Laura Chaves', cuenta: '002-666666-5', banco: 'BAC' }
      ]
    }
  ];

  // HISTORIAL DE TRANSACCIONES
  private transaccionesLocales = [
    { id: 1, usuarioId: 2, fecha: '2024-11-15', tipo: 'Transferencia', cuentaOrigen: '6543210987', cuentaDestino: '4444444444', monto: 50000, descripcion: 'Pago colegio', estado: 'Completada' },
    { id: 2, usuarioId: 2, fecha: '2024-11-10', tipo: 'Pago Servicio', cuentaOrigen: '6543210987', servicio: 'Electricidad', monto: 35000, descripcion: 'CNFL', estado: 'Completada' },
    { id: 3, usuarioId: 2, fecha: '2024-11-05', tipo: 'Depósito', cuentaOrigen: '1122334455', monto: 100000, descripcion: 'Depósito efectivo', estado: 'Completada' },
    { id: 4, usuarioId: 2, fecha: '2024-11-01', tipo: 'Retiro', cuentaOrigen: '1122334455', monto: 50000, descripcion: 'Cajero automático', estado: 'Completada' },
    { id: 5, usuarioId: 2, fecha: '2024-10-28', tipo: 'Transferencia', cuentaOrigen: '6543210987', cuentaDestino: '7777777777', monto: 75000, descripcion: 'Préstamo amigo', estado: 'Completada' }
  ];

  constructor(private router: Router) {
    console.log('AuthService inicializado');
    this.checkAuthStatus();
  }

  /**
   * Método principal de login
   */
  async login(email: string, password: string): Promise<boolean> {
    console.log('Login intentado:', email);

    // Buscar en usuarios locales
    const usuario = this.usuariosLocales.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
    );

    if (usuario) {
      console.log('Login LOCAL exitoso:', usuario.nombre);
      return this.loginLocal(usuario);
    }

    console.log(' Credenciales incorrectas');
    this.mostrarErrorLogin();
    return false;
  }

  /**
   * Login con usuario local
   */
  private loginLocal(usuario: Usuario): boolean {
    try {
      // Crear token simulado
      const tokenData = {
        usuarioId: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
        exp: Date.now() + 24 * 60 * 60 * 1000
      };

      const fakeToken = btoa(JSON.stringify(tokenData));

      // Guardar en localStorage
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('cuentas', JSON.stringify(usuario.cuentas));
      localStorage.setItem('beneficiarios', JSON.stringify(usuario.beneficiarios));
      localStorage.setItem('usuarioId', usuario.id.toString());

      this.isAuthenticated.next(true);

      // Redirigir
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);

      return true;
    } catch (error) {
      console.error('Error en login local:', error);
      return false;
    }
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('cuentas');
    localStorage.removeItem('beneficiarios');
    localStorage.removeItem('usuarioId');

    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);

    console.log('Sesión cerrada');
  }

  /**
   * Verifica autenticación
   */
  checkAuthStatus(): boolean {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    this.isAuthenticated.next(isAuth);
    return isAuth;
  }

  /**
   * Obtiene usuario actual
   */
  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene cuentas del usuario
   */
  getUserCuentas(): Cuenta[] {
    const cuentasStr = localStorage.getItem('cuentas');
    if (!cuentasStr) return [];

    try {
      return JSON.parse(cuentasStr);
    } catch {
      return [];
    }
  }

  /**
   * Obtiene beneficiarios
   */
  getUserBeneficiarios(): Beneficiario[] {
    const benefStr = localStorage.getItem('beneficiarios');
    if (!benefStr) return [];

    try {
      return JSON.parse(benefStr);
    } catch {
      return [];
    }
  }

  /**
   * Obtiene historial
   */
  getHistorialTransacciones(usuarioId?: number): any[] {
    const id = usuarioId || this.getCurrentUser()?.id;
    if (!id) return [];

    return this.transaccionesLocales.filter(t => t.usuarioId === id);
  }

  /**
   * Obtiene usuarios demo para login page
   */
  getUsuariosDemo(): any[] {
    return this.usuariosLocales.map(u => ({
      email: u.email,
      password: u.password,
      nombre: u.nombre,
      rol: u.rol,
      cuentas: u.cuentas.length
    }));
  }

  /**
   * Simula transferencia
   */
  simularTransferencia(datos: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const usuario = this.getCurrentUser();
        if (!usuario) {
          resolve({ success: false, mensaje: 'Usuario no autenticado' });
          return;
        }

        const nuevaTransaccion = {
          id: Date.now(),
          usuarioId: usuario.id, // ← AQUÍ ASEGURAMOS QUE SEA NUMBER
          fecha: new Date().toISOString().split('T')[0],
          tipo: 'Transferencia',
          cuentaOrigen: datos.cuentaOrigen,
          cuentaDestino: datos.cuentaDestino,
          monto: datos.monto,
          descripcion: datos.descripcion || 'Transferencia',
          estado: 'Completada'
        };

        // Agregar al historial
        this.transaccionesLocales.unshift(nuevaTransaccion);

        resolve({
          success: true,
          mensaje: 'Transferencia completada exitosamente',
          comprobante: `COMP-${Date.now()}`,
          transaccion: nuevaTransaccion
        });
      }, 1500);
    });
  }


  /**
   * Simula pago
   */
  simularPagoServicio(datos: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const usuario = this.getCurrentUser();
        if (!usuario) {
          resolve({ success: false, mensaje: 'Usuario no autenticado' });
          return;
        }

        const nuevaTransaccion = {
          id: Date.now(),
          usuarioId: usuario.id, // ← AQUÍ ASEGURAMOS QUE SEA NUMBER
          fecha: new Date().toISOString().split('T')[0],
          tipo: 'Pago Servicio',
          cuentaOrigen: datos.cuentaOrigen,
          servicio: datos.servicio,
          referencia: datos.referencia,
          monto: datos.monto,
          descripcion: `Pago de ${datos.servicio}`,
          estado: 'Completada'
        };

        this.transaccionesLocales.unshift(nuevaTransaccion);

        resolve({
          success: true,
          mensaje: 'Pago realizado exitosamente',
          comprobante: `PAGO-${Date.now()}`,
          transaccion: nuevaTransaccion
        });
      }, 1500);
    });
  }

  /**
   * Agrega beneficiario
   */
  agregarBeneficiario(beneficiario: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const beneficiarios = this.getUserBeneficiarios();

        const nuevoBeneficiario = {
          id: Date.now(),
          ...beneficiario
        };

        beneficiarios.push(nuevoBeneficiario);
        localStorage.setItem('beneficiarios', JSON.stringify(beneficiarios));

        resolve({
          success: true,
          mensaje: 'Beneficiario agregado',
          beneficiario: nuevoBeneficiario
        });
      }, 1000);
    });
  }

  /**
   * Muestra error
   */
  private mostrarErrorLogin(): void {
    alert('Credenciales incorrectas.\n\nUsuarios de prueba:\n' +
      '• admin@banco.com / admin123\n' +
      '• cliente@banco.com / cliente123\n' +
      '• gestor@banco.com / gestor123\n' +
      '• test@test.com / test123'
    );
  }

  /**
   * Verifica si está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  /**
   * Obtiene token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}