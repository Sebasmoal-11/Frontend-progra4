import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Cuenta } from '../models/models/types';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  constructor(private api: ApiService) { }

  obtenerCuentas(): Observable<Cuenta[]> {
    return this.api.get<Cuenta[]>('Cuenta/PorCliente/1');
  }

  obtenerCuenta(id: number): Observable<Cuenta> {
    return this.api.get<Cuenta>(`Cuenta/${id}`);
  }
}