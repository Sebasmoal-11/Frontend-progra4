import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  // ¡CORRECTO! Sin /api/ porque tu backend no lo usa para Cuenta
  private baseUrl = 'https://localhost:7245';

  constructor(private http: HttpClient) {}

  // ==================== MAPEOS PARA ENUMS ====================
  
  private mapearTipoCuenta(tipoNum: number): string {
    switch(tipoNum) {
      case 0: return 'Ahorros';
      case 1: return 'Corriente';
      case 2: return 'Inversión';
      case 3: return 'Plazo fijo';
      default: return 'Desconocido';
    }
  }

  private mapearMoneda(monedaNum: number): string {
    switch(monedaNum) {
      case 0: return 'CRC';
      case 1: return 'USD';
      default: return 'CRC';
    }
  }

  private mapearEstado(estadoNum: number): string {
    switch(estadoNum) {
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

  // ==================== MÉTODOS HTTP CORREGIDOS ====================

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
    
    let endpoint = '';
    
    if (estado.toLowerCase() === 'bloqueada') {
      endpoint = `${this.baseUrl}/Cuenta/${cuentaId}/Bloquear`;
    } else if (estado.toLowerCase() === 'cerrada') {
      endpoint = `${this.baseUrl}/Cuenta/${cuentaId}/Cerrar`;
    } else {
      // Para activar no hay endpoint visible en Swagger
      return new Observable(observer => {
        observer.error('Endpoint para activar no implementado');
      });
    }
    
    return this.http.post(endpoint, {}).pipe(
      map((response: any) => {
        return { 
          success: true, 
          mensaje: `Cuenta ${estado.toLowerCase()} exitosamente` 
        };
      }),
      catchError(error => {
        console.error('Error cambiando estado:', error);
        throw error;
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

  // ==================== MÉTODOS AUXILIARES ====================

  private mapearTipoToBackend(tipoString: string): number {
    switch(tipoString) {
      case 'Ahorros': return 0;
      case 'Corriente': return 1;
      case 'Inversión': return 2;
      case 'Plazo fijo': return 3;
      default: return 0;
    }
  }

  private mapearMonedaToBackend(monedaString: string): number {
    switch(monedaString) {
      case 'CRC': return 0;
      case 'USD': return 1;
      default: return 0;
    }
  }

  private generarNumeroCuenta(): string {
    return 'CR' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
}