import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CuentasService } from '../../services/cuentas.service';
import { TransferenciasService } from '../../services/transferencias.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import {
  IonicModule,
  AlertController,
  ToastController,
  LoadingController
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
  cuentas: any[] = []; // Cambiado a any[]
  beneficiarios: any[] = []; // Cambiado a any[]
  historialTransferencias: any[] = []; // Cambiado a any[]

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
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;

    try {
      const usuario = this.authService.getCurrentUser();
      const clienteId = usuario?.clienteId;

      if (!clienteId) {
        throw new Error('No se pudo obtener el ID del cliente');
      }

      // Cargar cuentas
      const cuentasResult = await this.cuentasService.getCuentasPorCliente(clienteId).toPromise();
      this.cuentas = cuentasResult || [];

      // Cargar beneficiarios - CORREGIDO: pasando clienteId
      const beneficiariosResult = await this.beneficiariosService.obtenerBeneficiarios(clienteId).toPromise();
      this.beneficiarios = beneficiariosResult || [];

      // Cargar historial de transferencias
      const transferenciasResult = await this.transferenciasService.obtenerTransferencias(clienteId).toPromise();
      this.historialTransferencias = transferenciasResult || [];

    } catch (error: any) {
      console.error('Error cargando datos:', error);
      this.mostrarToast(error.message || 'Error cargando datos', 'danger');
      // Limpiar arrays si hay error
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
    // Validaciones básicas
    if (!this.formularioValido()) {
      if (this.tipoDestino === 'propia' && this.transferencia.cuentaOrigenId === this.transferencia.cuentaDestinoId) {
        this.mostrarToast('No puede transferir a la misma cuenta', 'warning');
      } else {
        this.mostrarToast('Complete todos los campos requeridos', 'warning');
      }
      return;
    }

    // Verificar saldo (validación adicional)
    const cuentaOrigen = this.cuentas.find(c => c.cuentaId === this.transferencia.cuentaOrigenId);
    if (cuentaOrigen && this.transferencia.monto > cuentaOrigen.saldo) {
      this.mostrarToast('Saldo insuficiente en la cuenta origen', 'warning');
      return;
    }

    // Confirmar antes de proceder
    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirmar Transferencia',
      message: `¿Está seguro de transferir ₡${this.transferencia.monto.toLocaleString()} ${this.transferencia.moneda}?`,
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
    const loading = await this.loadingCtrl.create({
      message: 'Procesando transferencia...'
    });
    await loading.present();

    try {
      // Preparar datos según tipo de destino
      const datosTransferencia: any = {
        cuentaOrigenId: this.transferencia.cuentaOrigenId,
        monto: this.transferencia.monto,
        moneda: this.transferencia.moneda,
        esProgramada: this.transferencia.esProgramada,
        fechaEjecucion: this.transferencia.fechaEjecucion,
        idempotencyKey: this.transferencia.idempotencyKey,
        descripcion: this.transferencia.descripcion || 'Transferencia'
      };

      if (this.tipoDestino === 'propia') {
        datosTransferencia.cuentaDestinoId = this.transferencia.cuentaDestinoId;
      } else {
        datosTransferencia.terceroBeneficiarioId = this.transferencia.terceroBeneficiarioId;
      }

      // Usa lastValueFrom en lugar de toPromise()
      const resultado = await lastValueFrom(
        this.transferenciasService.crearTransferencia(datosTransferencia)
      );

      await loading.dismiss();
      this.mostrarToast('Transferencia creada exitosamente', 'success');
      this.limpiarFormulario();
      await this.cargarDatos(); // Recargar historial
      this.segment = 'historial';

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creando transferencia:', error);
      const mensaje = error.error?.mensaje || error.message || 'Error creando transferencia';
      this.mostrarToast(mensaje, 'danger');
    }
  }

  async cancelarTransferencia(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Cancelación',
      message: '¿Está seguro de cancelar esta transferencia programada?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Cancelando transferencia...'
            });
            await loading.present();

            try {
              await this.transferenciasService.cancelarTransferencia(id).toPromise();
              await loading.dismiss();
              this.mostrarToast('Transferencia cancelada exitosamente', 'success');
              await this.cargarDatos(); // Recargar historial
            } catch (error: any) {
              await loading.dismiss();
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

  // Método para obtener nombre de cuenta por ID
  obtenerNombreCuenta(cuentaId: number): string {
    const cuenta = this.cuentas.find(c => c.cuentaId === cuentaId);
    return cuenta ? `${cuenta.numero} - ${cuenta.tipo}` : 'Cuenta no encontrada';
  }

  // Método para obtener nombre de beneficiario por ID
  obtenerNombreBeneficiario(beneficiarioId: number): string {
    const beneficiario = this.beneficiarios.find(b => b.terceroBeneficiarioId === beneficiarioId);
    return beneficiario ? `${beneficiario.alias} - ${beneficiario.numeroCuenta}` : 'Beneficiario no encontrado';
  }
}