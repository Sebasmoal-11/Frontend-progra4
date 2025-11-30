import { Component, OnInit } from '@angular/core';
import { TransaccionesService } from '../../services/transacciones.service';
import { Transaccion } from '../../models/models/types';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  transacciones: Transaccion[] = [];
  loading = false;

  constructor(private transaccionesService: TransaccionesService) {}

  ngOnInit() {
    this.cargarTransacciones();
  }

  async cargarTransacciones() {
    this.loading = true;
    try {
      const resultado = await this.transaccionesService.obtenerTransaccionesPorCliente(1).toPromise();
      this.transacciones = resultado || []; // Manejar el undefined
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      this.transacciones = []; // En caso de error, array vacío
    } finally {
      this.loading = false;
    }
  }
}