import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariosService {
  private baseUrl = 'https://localhost:7245';

  constructor(private http: HttpClient) { }

  // Obtener beneficiarios por cliente
  obtenerBeneficiarios(clienteId: number): Observable<any[]> {
    const url = `${this.baseUrl}/Beneficiario/PorCliente/${clienteId}`;
    console.log(`GET ${url}`);

    return this.http.get<any[]>(url).pipe(
      map((beneficiarios: any[]) => {
        return beneficiarios.map(b => ({
          ...b,
          moneda: b.moneda === 0 ? 'CRC' : 'USD',
          estado: b.estado === 0 ? 'Activo' : 'Inactivo'
        }));
      }),
      catchError(error => {
        console.error('Error obteniendo beneficiarios:', error);
        return of([]);
      })
    );
  }
}