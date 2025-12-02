import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class TransferenciasService {
  private baseUrl = 'https://localhost:7245'; // Sin /api porque según Swagger está en raíz

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Mapear estado numérico a string
  private mapearEstadoTransferencia(estadoNum: number): string {
    switch (estadoNum) {
      case 0: return 'PendienteAprobacion';
      case 1: return 'Programada';
      case 2: return 'Exitosa';
      case 3: return 'Fallida';
      case 4: return 'Cancelada';
      case 5: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  // Mapear moneda numérica a string
  private mapearMoneda(monedaNum: number): string {
    switch (monedaNum) {
      case 0: return 'CRC';
      case 1: return 'USD';
      default: return 'CRC';
    }
  }

  // Obtener transferencias por cliente
  obtenerTransferencias(clienteId: number): Observable<any[]> {
    const url = `${this.baseUrl}/Transferencia/PorCliente/${clienteId}`;
    console.log(`GET ${url}`);

    return this.http.get<any[]>(url).pipe(
      map((transferencias: any[]) => {
        return transferencias.map(t => ({
          ...t,
          estado: this.mapearEstadoTransferencia(t.estado),
          moneda: this.mapearMoneda(t.moneda)
        }));
      }),
      catchError(error => {
        console.error('Error obteniendo transferencias:', error);
        throw error;
      })
    );
  }

  // Crear nueva transferencia
  crearTransferencia(datos: any): Observable<any> {
    const url = `${this.baseUrl}/Transferencia`;
    console.log('POST Creando transferencia:', datos);

    // Obtener clienteId del usuario actual
    const usuario = this.authService.getCurrentUser();
    const clienteId = usuario?.clienteId;

    if (!clienteId) {
      return throwError(() => new Error('No se pudo identificar al cliente'));
    }

    // Preparar datos para el backend
    const transferenciaBackend = {
      transferenciaId: 0,
      clienteId: clienteId,
      cuentaOrigenId: datos.cuentaOrigenId,
      cuentaDestinoId: datos.cuentaDestinoId || null,
      terceroBeneficiarioId: datos.terceroBeneficiarioId || null,
      monto: datos.monto,
      moneda: datos.moneda === 'CRC' ? 0 : 1, // Mapear a número
      fechaCreacion: new Date().toISOString(),
      fechaEjecucion: datos.fechaEjecucion || new Date().toISOString(),
      esProgramada: datos.esProgramada || false,
      estado: datos.esProgramada ? 1 : 0, // 1=Programada, 0=PendienteAprobacion
      saldoAntes: 0,
      saldoDespues: 0,
      comision: 0,
      idempotencyKey: datos.idempotencyKey || this.generarIdempotencyKey(),
      necesitaAprobacion: false, // Por ahora no requiere aprobación
      aprobadaPorUsuarioId: null
    };

    console.log('Datos para backend:', transferenciaBackend);

    return this.http.post(url, transferenciaBackend).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: 'Transferencia creada exitosamente',
          transferenciaId: response
        };
      }),
      catchError(error => {
        console.error('Error creando transferencia:', error);
        throw error;
      })
    );
  }

  // Cancelar transferencia
  cancelarTransferencia(transferenciaId: number): Observable<any> {
    const url = `${this.baseUrl}/Transferencia/${transferenciaId}/Cancelar`;
    console.log(`POST ${url}`);

    return this.http.post(url, {}).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: 'Transferencia cancelada exitosamente'
        };
      }),
      catchError(error => {
        console.error('Error cancelando transferencia:', error);
        throw error;
      })
    );
  }

  // Aprobar transferencia (para gestores/administradores)
  aprobarTransferencia(transferenciaId: number): Observable<any> {
    const url = `${this.baseUrl}/Transferencia/${transferenciaId}/Aprobar`;
    console.log(`POST ${url}`);

    return this.http.post(url, {}).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: 'Transferencia aprobada exitosamente'
        };
      }),
      catchError(error => {
        console.error('Error aprobando transferencia:', error);
        throw error;
      })
    );
  }

  // Rechazar transferencia (para gestores/administradores)
  rechazarTransferencia(transferenciaId: number): Observable<any> {
    const url = `${this.baseUrl}/Transferencia/${transferenciaId}/Rechazar`;
    console.log(`POST ${url}`);

    return this.http.post(url, {}).pipe(
      map((response: any) => {
        return {
          success: true,
          mensaje: 'Transferencia rechazada exitosamente'
        };
      }),
      catchError(error => {
        console.error('Error rechazando transferencia:', error);
        throw error;
      })
    );
  }

  // Obtener transferencia por ID
  obtenerTransferencia(id: number): Observable<any> {
    const url = `${this.baseUrl}/Transferencia/${id}`;
    console.log(`GET ${url}`);

    return this.http.get<any>(url).pipe(
      map(transferencia => ({
        ...transferencia,
        estado: this.mapearEstadoTransferencia(transferencia.estado),
        moneda: this.mapearMoneda(transferencia.moneda)
      })),
      catchError(error => {
        console.error('Error obteniendo transferencia:', error);
        throw error;
      })
    );
  }

  // Generar ID único para idempotencia
  private generarIdempotencyKey(): string {
    return `trf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}