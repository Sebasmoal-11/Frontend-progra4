// En apertura-cuenta.page.ts - CORREGIDO
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  ModalController, 
  ToastController 
} from '@ionic/angular';
import { AuthService, Usuario } from '../../../services/auth'; // Importar Usuario
import { CuentasService } from '../../../services/cuentas.service';

@Component({
  selector: 'app-apertura-cuenta',
  templateUrl: './apertura-cuenta.page.html',
  styleUrls: ['./apertura-cuenta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AperturaCuentaPage implements OnInit {
  @Input() clientes: any[] = [];
  
  datosCuenta = {
    clienteId: null as number | null,
    tipoCuenta: '',
    moneda: 'CRC',
    saldoInicial: 0,
    alias: ''
  };
  
  tiposCuenta = ['Ahorros', 'Corriente', 'Inversión', 'Plazo fijo'];
  monedas = ['CRC', 'USD'];
  
  esAdmin = false;
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private cuentasService: CuentasService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const usuario: Usuario | null = this.authService.getCurrentUser();
    this.esAdmin = usuario?.rol === 'Administrador';
    
    // Si es gestor, asignar el cliente del gestor
    if (usuario?.rol === 'Gestor' && usuario.clienteId) {
      this.datosCuenta.clienteId = usuario.clienteId; // clienteId es number, no undefined
    }
  }

  formularioValido(): boolean {
    // Si es gestor y tiene clienteId asignado, está válido
    if (!this.esAdmin && this.datosCuenta.clienteId) {
      return (
        !!this.datosCuenta.tipoCuenta &&
        !!this.datosCuenta.moneda &&
        this.datosCuenta.saldoInicial >= 0
      );
    }
    
    // Si es admin, necesita seleccionar cliente
    return (
      (this.esAdmin ? !!this.datosCuenta.clienteId : true) &&
      !!this.datosCuenta.tipoCuenta &&
      !!this.datosCuenta.moneda &&
      this.datosCuenta.saldoInicial >= 0
    );
  }

  async abrirCuenta() {
    if (!this.formularioValido()) {
      this.mostrarToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;

    try {
      const datosParaEnviar = {
        tipoCuenta: this.datosCuenta.tipoCuenta,
        moneda: this.datosCuenta.moneda,
        saldo: this.datosCuenta.saldoInicial,
        clienteId: this.datosCuenta.clienteId,
        alias: this.datosCuenta.alias || undefined
      };

      const resultado: any = await this.cuentasService.abrirCuenta(datosParaEnviar).toPromise();
      
      if (resultado && resultado.success) {
        this.mostrarToast(resultado.mensaje || 'Cuenta abierta exitosamente', 'success');
        this.modalCtrl.dismiss({ success: true, cuenta: resultado.cuenta });
      } else {
        this.mostrarToast(resultado?.mensaje || 'Error al abrir cuenta', 'danger');
      }
      
    } catch (error: any) {
      console.error('Error al abrir cuenta:', error);
      const mensaje = error.error?.mensaje || error.message || 'Error al abrir cuenta';
      this.mostrarToast(mensaje, 'danger');
    } finally {
      this.loading = false;
    }
  }

  cancelar() {
    this.modalCtrl.dismiss({ success: false });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}