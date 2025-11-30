import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Beneficiario } from '../models/models/types';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariosService {

  constructor(private api: ApiService) { }

  obtenerBeneficiarios(): Observable<Beneficiario[]> {
    return this.api.get<Beneficiario[]>('Beneficiario/PorCliente/1');
  }
}