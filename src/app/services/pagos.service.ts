import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { PagoServicio } from '../models/models/types';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private api: ApiService) { }

  realizarPago(pago: any): Observable<any> {
    return this.api.post('PagoServicio', pago);
  }

  obtenerPagos(clienteId: number): Observable<PagoServicio[]> {
    return this.api.get<PagoServicio[]>(`PagoServicio/PorCliente/${clienteId}`);
  }

  cancelarPago(id: number): Observable<any> {
    return this.api.post(`PagoServicio/${id}/Cancelar`, {});
  }
}