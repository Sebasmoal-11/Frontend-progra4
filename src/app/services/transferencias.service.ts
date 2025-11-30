import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';
import { Transferencia } from '../models/models/types';

@Injectable({
  providedIn: 'root'
})
export class TransferenciasService {

  constructor(private api: ApiService) { }

  obtenerTransferencias(clienteId: number): Observable<Transferencia[]> {
    return this.api.get<Transferencia[]>(`Transferencia/PorCliente/${clienteId}`);
  }

  crearTransferencia(transferencia: any): Observable<any> {
    return this.api.post('Transferencia', transferencia);
  }

  cancelarTransferencia(id: number): Observable<any> {
    return this.api.post(`Transferencia/${id}/Cancelar`, {});
  }
}