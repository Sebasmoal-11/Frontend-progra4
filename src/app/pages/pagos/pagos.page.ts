import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  AlertController, 
  ToastController 
} from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { CuentasService } from '../../services/cuentas.service';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PagosPage implements OnInit {
  cuentas: any[] = [];
  pagos: any[] = [];
  loading = false;
  
  // Proveedores - simplificado
  proveedores: string[] = ['Electricidad', 'Agua', 'Telefonía', 'Internet', 'Impuestos'];
  proveedorSeleccionado: string = '';
  
  // Datos para nuevo pago
  pago = {
    cuentaOrigenId: null as number | null,
    proveedor: '',
    numeroContrato: '',
    monto: 0,
    esProgramado: false
  };

  constructor(
    private authService: AuthService,
    private cuentasService: CuentasService,
    private pagosService: PagosService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarCuentas();
    await this.cargarPagos();
  }

  async cargarCuentas() {
    this.loading = true;
    try {
      const clienteId = this.authService.getClienteId();
      if (clienteId) {
        const resultado = await this.cuentasService.getCuentasPorCliente(clienteId).toPromise();
        this.cuentas = resultado || [];
      }
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      this.mostrarToast('Error cargando cuentas', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async cargarPagos() {
    // Implementar según servicio
    try {
      // this.pagos = await this.pagosService.obtenerPagos().toPromise();
    } catch (error) {
      console.error('Error cargando pagos:', error);
    }
  }

  // Método para seleccionar proveedor
  seleccionarProveedor(proveedor: string) {
    this.proveedorSeleccionado = proveedor;
    this.pago.proveedor = proveedor;
  }

  // Validar formulario
  formularioValido(): boolean {
    return (
      !!this.pago.cuentaOrigenId &&
      !!this.pago.proveedor &&
      !!this.pago.numeroContrato &&
      this.pago.monto > 0
    );
  }

  async realizarPago() {
    if (!this.formularioValido()) {
      this.mostrarToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;
    try {
      // Implementar llamada al servicio real
      // const resultado = await this.pagosService.realizarPago(this.pago).toPromise();
      
      // Temporal
      this.mostrarToast('Pago realizado exitosamente', 'success');
      this.limpiarFormulario();
      await this.cargarPagos();
    } catch (error) {
      console.error('Error realizando pago:', error);
      this.mostrarToast('Error realizando pago', 'danger');
    } finally {
      this.loading = false;
    }
  }

  limpiarFormulario() {
    this.pago = {
      cuentaOrigenId: null,
      proveedor: '',
      numeroContrato: '',
      monto: 0,
      esProgramado: false
    };
    this.proveedorSeleccionado = '';
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}