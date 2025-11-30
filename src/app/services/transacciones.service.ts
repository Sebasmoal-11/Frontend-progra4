import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Transaccion } from '../models/models/types';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  constructor(private api: ApiService) { }

  obtenerTransaccionesPorCuenta(cuentaId: number): Observable<Transaccion[]> {
    return this.api.get<Transaccion[]>(`TransaccionCuenta/PorCuenta/${cuentaId}`);
  }

  obtenerTransaccionesPorCliente(clienteId: number): Observable<Transaccion[]> {
    return this.api.get<Transaccion[]>(`TransaccionCuenta/PorCliente/${clienteId}`);
  }

  obtenerTransaccion(id: number): Observable<Transaccion> {
    return this.api.get<Transaccion>(`TransaccionCuenta/${id}`);
  }
}