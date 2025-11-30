import { Component, OnInit } from '@angular/core';
import { CuentasService } from '../../services/cuentas.service';
import { Cuenta } from '../../models/models/types';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
})
export class CuentasPage implements OnInit {
  cuentas: Cuenta[] = [];
  loading = false;

  constructor(private cuentasService: CuentasService) {}

  ngOnInit() {
    this.cargarCuentas();
  }

  async cargarCuentas() {
    this.loading = true;
    try {
      const resultado = await this.cuentasService.obtenerCuentas().toPromise();
      this.cuentas = resultado || []; // Manejar el undefined
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      this.cuentas = []; // En caso de error, array vacío
    } finally {
      this.loading = false;
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Activa': return 'success';
      case 'Bloqueada': return 'warning';
      case 'Cerrada': return 'danger';
      default: return 'medium';
    }
  }
}