import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/models/types';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private api: ApiService) { }

  obtenerProveedores(): Observable<Proveedor[]> {
    return this.api.get<Proveedor[]>('ProveedorServicio');
  }

  obtenerProveedor(id: number): Observable<Proveedor> {
    return this.api.get<Proveedor>(`ProveedorServicio/${id}`);
  }
}