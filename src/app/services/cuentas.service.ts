import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  // ¡CORRECTO! Sin /api/ porque tu backend no lo usa para Cuenta
  private baseUrl = 'https://localhost:7245';

  constructor(private http: HttpClient) { }

  // ==================== MAPEOS PARA ENUMS ====================

  private mapearTipoCuenta(tipoNum: number): string {
    switch (tipoNum) {
      case 0: return 'Ahorros';
      case 1: return 'Corriente';
      case 2: return 'Inversión';
      case 3: return 'Plazo fijo';
      default: return 'Desconocido';
    }
  }

  private mapearMoneda(monedaNum: number): string {
    switch (monedaNum) {
      case 0: return 'CRC';
      case 1: return 'USD';
      default: return 'CRC';
    }
  }

  private mapearEstado(estadoNum: number): string {
    switch (estadoNum) {
      case 0: return 'Activa';
      case 1: return 'Bloqueada';
      case 2: return 'Cerrada';
      default: return 'Activa';
    }
  }

  // ==================== MÉTODO PRINCIPAL DE MAPEO ====================

  private mapearCuentaParaUI(cuentaBackend: any): any {
    console.log('Cuenta del backend:', cuentaBackend);

    const cuentaMapeada = {
      cuentaId: cuentaBackend.cuentaId,
      numero: cuentaBackend.numeroCuenta,
      numeroCuenta: cuentaBackend.numeroCuenta,
      tipo: this.mapearTipoCuenta(cuentaBackend.tipoCuenta),
      tipoCuenta: cuentaBackend.tipoCuenta,
      moneda: this.mapearMoneda(cuentaBackend.moneda),
      saldo: cuentaBackend.saldo,
      estado: this.mapearEstado(cuentaBackend.estadoCuenta),
      estadoCuenta: cuentaBackend.estadoCuenta,
      clienteId: cuentaBackend.clienteId,
      alias: cuentaBackend.alias || `Cuenta ${this.mapearTipoCuenta(cuentaBackend.tipoCuenta)}`
    };

    console.log('Cuenta mapeada para UI:', cuentaMapeada);
    return cuentaMapeada;
  }

  // Obtener cuentas por cliente ID
  getCuentasPorCliente(clienteId: number): Observable<any[]> {
    const url = `${this.baseUrl}/Cuenta/PorCliente/${clienteId}`;
    console.log(`GET ${url}`);

    return this.http.get<any[]>(url).pipe(
      map((cuentas: any[]) => {
        console.log('Cuentas recibidas:', cuentas);
        return cuentas.map(c => this.mapearCuentaParaUI(c));
      }),
      catchError(error => {
        console.error('Error obteniendo cuentas:', error);
        return of([]);
      })
    );
  }
  // Obtener todas las cuentas (para admin/gestor)
  getAllCuentas(): Observable<any[]> {
    // Método alternativo: Obtener todos los clientes y luego todas sus cuentas
    return new Observable(observer => {
      // Primero obtener todos los clientes
      fetch('https://localhost:7245/Cliente', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })
        .then(response => response.json())
        .then(async (clientes: any[]) => {
          const todasLasCuentas: any[] = [];

          // Para cada cliente, obtener sus cuentas
          for (const cliente of clientes) {
            try {
              const response = await fetch(`https://localhost:7245/Cuenta/PorCliente/${cliente.clienteId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Accept': 'application/json'
                }
              });

              if (response.ok) {
                const cuentasCliente = await response.json();
                // Agregar nombre del cliente a cada cuenta
                const cuentasConCliente = cuentasCliente.map((cuenta: any) => ({
                  ...this.mapearCuentaParaUI(cuenta),
                  clienteNombre: cliente.nombreCompleto
                }));
                todasLasCuentas.push(...cuentasConCliente);
              }
            } catch (error) {
              console.warn(`Error obteniendo cuentas del cliente ${cliente.clienteId}:`, error);
            }
          }

          observer.next(todasLasCuentas);
          observer.complete();
        })
        .catch(error => {
          console.error('Error obteniendo clientes:', error);
          observer.next([]);
          observer.complete();
        });
    });
  }

  // Obtener cuenta por ID
  getCuentaPorId(cuentaId: number): Observable<any> {
    const url = `${this.baseUrl}/Cuenta/${cuentaId}`;
    console.log(`GET ${url}`);

    return this.http.get<any>(url).pipe(
      map(cuenta => this.mapearCuentaParaUI(cuenta)),
      catchError(error => {
        console.error('Error obteniendo cuenta:', error);
        throw error;
      })
    );
  }

  // Crear nueva cuenta
  abrirCuenta(cuentaData: any): Observable<any> {
    const url = `${this.baseUrl}/Cuenta`;
    console.log('POST Creando cuenta:', cuentaData);

    // Mapear de frontend a backend
    const cuentaBackend = {
      cuentaId: 0,
      numeroCuenta: cuentaData.numero || this.generarNumeroCuenta(),
      tipoCuenta: this.mapearTipoToBackend(cuentaData.tipo),
      moneda: this.mapearMonedaToBackend(cuentaData.moneda),
      saldo: cuentaData.saldo || 0,
      estadoCuenta: 0, // Activa por defecto
      clienteId: cuentaData.clienteId,
      alias: cuentaData.alias
    };

    console.log('Datos para backend:', cuentaBackend);

    return this.http.post(url, cuentaBackend).pipe(
      catchError(error => {
        console.error('Error abriendo cuenta:', error);
        throw error;
      })
    );
  }

  // Cambiar estado de cuenta
  cambiarEstado(cuentaId: number, estado: string): Observable<any> {
    console.log(`Cambiando estado cuenta ${cuentaId} a ${estado}`);

    // Si es para activar, usaremos PUT /Cuenta/{id} con el nuevo estado
    if (estado.toLowerCase() === 'activa') {
      return this.activarCuenta(cuentaId);
    }

    // Para bloquear y cerrar, usamos los endpoints específicos de POST
    let endpoint = '';
    let mensajeExito = '';

    if (estado.toLowerCase() === 'bloqueada') {
      endpoint = `${this.baseUrl}/Cuenta/${cuentaId}/Bloquear`;
      mensajeExito = 'Cuenta bloqueada exitosamente';
    } else if (estado.toLowerCase() === 'cerrada') {
      endpoint = `${this.baseUrl}/Cuenta/${cuentaId}/Cerrar`;
      mensajeExito = 'Cuenta cerrada exitosamente';
    } else {
      return throwError(() => new Error('Estado no válido'));
    }

    console.log(`POST ${endpoint}`);

    return this.http.post(endpoint, {}).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: mensajeExito
        };
      }),
      catchError((error: any) => {
        console.error('Error cambiando estado:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });

        let mensajeError = 'Error al cambiar el estado de la cuenta';
        if (error.error) {
          mensajeError = error.error;
        }

        return throwError(() => new Error(mensajeError));
      })
    );
  }

  // Eliminar cuenta
  eliminarCuenta(cuentaId: number): Observable<any> {
    const url = `${this.baseUrl}/Cuenta/${cuentaId}`;
    console.log(`DELETE ${url}`);

    return this.http.delete(url).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: 'Cuenta eliminada exitosamente'
        };
      }),
      catchError((error: any) => {
        console.error('Error eliminando cuenta:', error);

        // Extraer mensaje de error específico
        let mensajeError = 'Error al eliminar la cuenta';

        if (error.status === 400) {
          mensajeError = error.error || 'No se puede eliminar la cuenta. Verifique que tenga saldo 0 y no esté activa.';
        } else if (error.status === 404) {
          mensajeError = 'Cuenta no encontrada';
        } else if (error.status === 403) {
          mensajeError = 'No tiene permisos para eliminar esta cuenta';
        }

        return throwError(() => new Error(mensajeError));
      })
    );
  }

  // Activar cuenta
  activarCuenta(cuentaId: number): Observable<any> {
    console.log(`Activando cuenta ${cuentaId}`);

    // OPCIÓN 1: Intentar con PUT /Cuenta/{id} si existe (pero en Swagger no aparece)
    const url = `${this.baseUrl}/Cuenta/${cuentaId}`;
    const datosActualizacion = {
      estadoCuenta: 0 // 0 = Activa
    };

    console.log(`PUT ${url} con datos:`, datosActualizacion);

    return this.http.put(url, datosActualizacion).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: 'Cuenta activada exitosamente'
        };
      }),
      catchError((error: any) => {
        console.error('Error con PUT:', error);

        // OPCIÓN 2: Si PUT no funciona, intentar con POST a un endpoint alternativo
        // Probablemente necesites agregar este endpoint al backend
        console.log('PUT falló, intentando alternativa...');

        // Como no hay endpoint para activar, intentamos con PUT genérico
        // o mostramos un mensaje de que no está implementado
        if (error.status === 405 || error.status === 404) {
          return throwError(() => new Error('El endpoint para activar cuentas no está implementado en el backend. Contacte al administrador.'));
        }

        let mensajeError = 'Error al activar la cuenta';
        if (error.error) {
          mensajeError = error.error;
        }

        return throwError(() => new Error(mensajeError));
      })
    );
  }


  // Obtener cuenta por número (haremos búsqueda manual)
  getCuentaPorNumero(numero: string): Observable<any> {
    // Primero obtenemos todas y filtramos
    return this.getAllCuentas().pipe(
      map(cuentas => {
        const cuenta = cuentas.find(c => c.numero === numero);
        if (!cuenta) {
          throw new Error(`Cuenta ${numero} no encontrada`);
        }
        return cuenta;
      }),
      catchError(error => {
        console.error('Error obteniendo cuenta por número:', error);
        throw error;
      })
    );
  }

  getEstadisticasDashboard(): Observable<any> {
    return new Observable(observer => {
      this.getAllCuentas().subscribe(cuentas => {
        const cuentasActivas = cuentas.filter(c => c.estado === 'Activa');
        const cuentasBloqueadas = cuentas.filter(c => c.estado === 'Bloqueada');
        const cuentasCerradas = cuentas.filter(c => c.estado === 'Cerrada');

        const saldoTotalCRC = cuentasActivas
          .filter(c => c.moneda === 'CRC')
          .reduce((total, c) => total + c.saldo, 0);

        const saldoTotalUSD = cuentasActivas
          .filter(c => c.moneda === 'USD')
          .reduce((total, c) => total + c.saldo, 0);

        const estadisticas = {
          totalCuentas: cuentas.length,
          cuentasActivas: cuentasActivas.length,
          cuentasBloqueadas: cuentasBloqueadas.length,
          cuentasCerradas: cuentasCerradas.length,
          saldoTotalCRC: saldoTotalCRC,
          saldoTotalUSD: saldoTotalUSD,
          saldoTotal: saldoTotalCRC + (saldoTotalUSD * 650) // Asumiendo tasa de cambio 1 USD = 650 CRC
        };

        observer.next(estadisticas);
        observer.complete();
      });
    });
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private mapearTipoToBackend(tipoString: string): number {
    switch (tipoString) {
      case 'Ahorros': return 0;
      case 'Corriente': return 1;
      case 'Inversión': return 2;
      case 'Plazo fijo': return 3;
      default: return 0;
    }
  }

  private mapearMonedaToBackend(monedaString: string): number {
    switch (monedaString) {
      case 'CRC': return 0;
      case 'USD': return 1;
      default: return 0;
    }
  }

  private generarNumeroCuenta(): string {
    return 'CR' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
}