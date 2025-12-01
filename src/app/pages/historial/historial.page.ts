import { Component, OnInit } from '@angular/core';
import { TransaccionesService } from '../../services/transacciones.service';
import { Transaccion } from '../../models/models/types';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true, 
  imports: [IonicModule, CommonModule, FormsModule]
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