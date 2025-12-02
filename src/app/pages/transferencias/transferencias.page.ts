import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CuentasService } from '../../services/cuentas.service';
import { TransferenciasService } from '../../services/transferencias.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { Cuenta, Beneficiario, Transferencia } from '../../models/models/types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  AlertController, 
  ToastController 
} from '@ionic/angular';

@Component({
  selector: 'app-transferencias',
  templateUrl: './transferencias.page.html',
  styleUrls: ['./transferencias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TransferenciasPage implements OnInit {
  segment = 'nueva';
  cuentas: Cuenta[] = [];
  beneficiarios: Beneficiario[] = [];
  historialTransferencias: Transferencia[] = [];

  tipoDestino = 'propia';
  loading = false;

  transferencia = {
    cuentaOrigenId: null as number | null,
    cuentaDestinoId: null as number | null,
    terceroBeneficiarioId: null as number | null,
    monto: 0,
    moneda: 'CRC',
    esProgramada: false,
    fechaEjecucion: new Date().toISOString(),
    idempotencyKey: this.generateIdempotencyKey(),
    descripcion: ''
  };

  minDate = new Date().toISOString();
  maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  constructor(
    private authService: AuthService,
    private cuentasService: CuentasService,
    private transferenciasService: TransferenciasService,
    private beneficiariosService: BeneficiariosService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    
    try {
      const clienteId = this.authService.getClienteId();
      
      if (clienteId) {
        // 1. Cargar cuentas del cliente
        const cuentasResult = await this.cuentasService.getCuentasPorCliente(clienteId).toPromise();
        this.cuentas = cuentasResult || [];
        
        // 2. Cargar beneficiarios del cliente
        const beneficiariosResult = await this.beneficiariosService.obtenerBeneficiarios().toPromise();
        this.beneficiarios = beneficiariosResult || [];
        
        // 3. Cargar transferencias del cliente
        const transferenciasResult = await this.transferenciasService.obtenerTransferencias(clienteId).toPromise();
        this.historialTransferencias = transferenciasResult || [];
      } else {
        // Si no hay clienteId, arrays vacíos
        this.cuentas = [];
        this.beneficiarios = [];
        this.historialTransferencias = [];
        this.mostrarToast('No se pudo identificar al cliente', 'warning');
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.mostrarToast('Error cargando datos', 'danger');
      this.cuentas = [];
      this.beneficiarios = [];
      this.historialTransferencias = [];
    } finally {
      this.loading = false;
    }
  }

  cambiarTipoDestino() {
    this.transferencia.cuentaDestinoId = null;
    this.transferencia.terceroBeneficiarioId = null;
  }

  generateIdempotencyKey(): string {
    return `trf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validar formulario
  formularioValido(): boolean {
    if (this.tipoDestino === 'propia') {
      return (
        !!this.transferencia.cuentaOrigenId &&
        !!this.transferencia.cuentaDestinoId &&
        this.transferencia.monto > 0 &&
        this.transferencia.cuentaOrigenId !== this.transferencia.cuentaDestinoId
      );
    } else {
      return (
        !!this.transferencia.cuentaOrigenId &&
        !!this.transferencia.terceroBeneficiarioId &&
        this.transferencia.monto > 0
      );
    }
  }

  async crearTransferencia() {
    if (!this.formularioValido()) {
      if (this.tipoDestino === 'propia' && this.transferencia.cuentaOrigenId === this.transferencia.cuentaDestinoId) {
        this.mostrarToast('No puede transferir a la misma cuenta', 'warning');
      } else {
        this.mostrarToast('Complete todos los campos requeridos', 'warning');
      }
      return;
    }

    // Confirmar antes de proceder
    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirmar Transferencia',
      message: `¿Está seguro de transferir ${this.transferencia.monto} ${this.transferencia.moneda}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.ejecutarTransferencia();
          }
        }
      ]
    });
    
    await confirmAlert.present();
  }

  private async ejecutarTransferencia() {
    this.loading = true;

    try {
      // Preparar datos según tipo de destino
      const datosTransferencia: any = {
        cuentaOrigenId: this.transferencia.cuentaOrigenId,
        monto: this.transferencia.monto,
        moneda: this.transferencia.moneda,
        esProgramada: this.transferencia.esProgramada,
        fechaEjecucion: this.transferencia.esProgramada ? this.transferencia.fechaEjecucion : new Date().toISOString(),
        idempotencyKey: this.transferencia.idempotencyKey,
        descripcion: this.transferencia.descripcion || 'Transferencia'
      };

      if (this.tipoDestino === 'propia') {
        datosTransferencia.cuentaDestinoId = this.transferencia.cuentaDestinoId;
      } else {
        datosTransferencia.terceroBeneficiarioId = this.transferencia.terceroBeneficiarioId;
      }

      const resultado = await this.transferenciasService.crearTransferencia(datosTransferencia).toPromise();
      
      this.mostrarToast('Transferencia creada exitosamente', 'success');
      this.limpiarFormulario();
      await this.cargarDatos(); // Recargar historial
      this.segment = 'historial';
      
    } catch (error: any) {
      console.error('Error creando transferencia:', error);
      const mensaje = error.error?.mensaje || error.message || 'Error creando transferencia';
      this.mostrarToast(mensaje, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async cancelarTransferencia(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Cancelación',
      message: '¿Está seguro de cancelar esta transferencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.transferenciasService.cancelarTransferencia(id).toPromise();
              this.mostrarToast('Transferencia cancelada', 'success');
              await this.cargarDatos(); // Recargar historial
            } catch (error: any) {
              console.error('Error cancelando transferencia:', error);
              const mensaje = error.error?.mensaje || error.message || 'Error cancelando transferencia';
              this.mostrarToast(mensaje, 'danger');
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  limpiarFormulario() {
    this.transferencia = {
      cuentaOrigenId: null,
      cuentaDestinoId: null,
      terceroBeneficiarioId: null,
      monto: 0,
      moneda: 'CRC',
      esProgramada: false,
      fechaEjecucion: new Date().toISOString(),
      idempotencyKey: this.generateIdempotencyKey(),
      descripcion: ''
    };
    this.tipoDestino = 'propia';
  }

  segmentChanged() {
    if (this.segment === 'historial') {
      this.cargarDatos();
    }
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

  // Método para formatear fecha
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Método para obtener estado de transferencia
  obtenerEstadoTransferencia(estado: string): string {
    const estados: {[key: string]: string} = {
      'PendienteAprobacion': 'Pendiente Aprobación',
      'Programada': 'Programada',
      'Exitosa': 'Exitosa',
      'Fallida': 'Fallida',
      'Cancelada': 'Cancelada',
      'Rechazada': 'Rechazada'
    };
    return estados[estado] || estado;
  }

  // Color por estado
  colorEstado(estado: string): string {
    switch (estado) {
      case 'Exitosa': return 'success';
      case 'PendienteAprobacion':
      case 'Programada': return 'warning';
      case 'Fallida':
      case 'Rechazada': return 'danger';
      case 'Cancelada': return 'medium';
      default: return 'primary';
    }
  }
}