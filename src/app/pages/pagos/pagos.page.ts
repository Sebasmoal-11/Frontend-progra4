import { Component, OnInit } from '@angular/core';
import { ProveedoresService } from '../../services/proveedores.service';
import { CuentasService } from '../../services/cuentas.service';
import { PagosService } from '../../services/pagos.service';
import { Cuenta, Proveedor } from '../../models/models/types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PagosPage implements OnInit {
  proveedores: Proveedor[] = [];
  cuentas: Cuenta[] = [];
  proveedorSeleccionado: Proveedor | null = null;
  loading = false;

  pago = {
    proveedorId: 0,
    numeroContrato: '',
    cuentaOrigenId: null as number | null,
    monto: 0,
    esProgramado: false
  };

  constructor(
    private proveedoresService: ProveedoresService,
    private cuentasService: CuentasService,
    private pagosService: PagosService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    try {
      // Datos de prueba
      this.proveedores = [
        { proveedorServicioId: 1, nombre: 'ICE', longitudMinContrato: 8, longitudMaxContrato: 10, reglasAdicionales: 'Solo números' },
        { proveedorServicioId: 2, nombre: 'AyA', longitudMinContrato: 9, longitudMaxContrato: 12, reglasAdicionales: 'Solo números' },
        { proveedorServicioId: 3, nombre: 'CNFL', longitudMinContrato: 7, longitudMaxContrato: 9, reglasAdicionales: 'Solo números' }
      ];
      
      const resultado = await this.cuentasService.obtenerCuentas().toPromise();
      this.cuentas = resultado || [];
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.loading = false;
    }
  }

  seleccionarProveedor(proveedor: Proveedor) {
    this.proveedorSeleccionado = proveedor;
    this.pago.proveedorId = proveedor.proveedorServicioId;
  }

  async realizarPago() {
    if (!this.proveedorSeleccionado || !this.pago.cuentaOrigenId) {
      return;
    }

    this.loading = true;
    try {
      // Aquí llamarías al servicio real
      console.log('Realizando pago:', this.pago);
      
      // Simulación de éxito
      alert('¡Pago realizado exitosamente!');
      
      // Limpiar formulario
      this.pago = {
        proveedorId: 0,
        numeroContrato: '',
        cuentaOrigenId: null,
        monto: 0,
        esProgramado: false
      };
      this.proveedorSeleccionado = null;
      
    } catch (error) {
      console.error('Error realizando pago:', error);
      alert('Error al realizar el pago');
    } finally {
      this.loading = false;
    }
  }
}