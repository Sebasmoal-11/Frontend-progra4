import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable, of } from 'rxjs';
import { Beneficiario } from '../models/models/types';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariosService {

  constructor(
    private api: ApiService,
    private authService: AuthService 
  ) { }

  obtenerBeneficiarios(): Observable<Beneficiario[]> {
    const clienteId = this.authService.getClienteId();
    if (clienteId) {
      return this.api.get<Beneficiario[]>(`Beneficiario/PorCliente/${clienteId}`);
    } else {
      // Si no hay clienteId, devolver array vacío
      return of([]);
    }
  }
}