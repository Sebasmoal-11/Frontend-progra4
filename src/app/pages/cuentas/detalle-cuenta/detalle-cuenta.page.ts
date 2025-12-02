import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  AlertController, 
  ToastController,
  NavController 
} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CuentasService } from '../../../services/cuentas.service';

@Component({
  selector: 'app-detalle-cuenta',
  templateUrl: './detalle-cuenta.page.html',
  styleUrls: ['./detalle-cuenta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetalleCuentaPage implements OnInit {
  cuenta: any = null;
  numeroCuenta: string = '';
  loading = true;
  
  usuarioActual: any;
  esAdmin = false;
  puedeBloquear = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private authService: AuthService,
    private cuentasService: CuentasService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.numeroCuenta = this.route.snapshot.paramMap.get('numero') || '';
    
    if (this.numeroCuenta) {
      await this.cargarDatos();
    } else {
      this.navCtrl.back();
    }
  }

  async cargarDatos() {
    this.loading = true;
    
    this.usuarioActual = this.authService.getCurrentUser();
    this.esAdmin = this.usuarioActual?.rol === 'Administrador';
    this.puedeBloquear = this.esAdmin;
    
    try {
      this.cuentasService.getCuentaPorNumero(this.numeroCuenta).subscribe(
        cuenta => {
          this.cuenta = cuenta;
          this.loading = false;
        },
        error => {
          console.error('Error cargando cuenta:', error);
          this.mostrarToast('Error cargando información de la cuenta', 'danger');
          this.loading = false;
          this.navCtrl.back();
        }
      );
    } catch (error) {
      console.error('Error:', error);
      this.loading = false;
    }
  }

  // Bloquear/Activar cuenta - CORREGIDO
  async cambiarEstado() {
    if (!this.puedeBloquear || !this.cuenta) return;
    
    const nuevoEstado = this.cuenta.estado === 'Activa' ? 'Bloqueada' : 'Activa';
    const accion = nuevoEstado === 'Bloqueada' ? 'bloquear' : 'activar';
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Está seguro de ${accion} la cuenta ${this.cuenta.numero}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            // USAR CUENTAS SERVICE EN LUGAR DE AUTH SERVICE
            this.cuentasService.cambiarEstado(this.cuenta.cuentaId, nuevoEstado).subscribe(
              (resultado: any) => {
                if (resultado.success) {
                  this.mostrarToast(resultado.mensaje, 'success');
                  this.cuenta.estado = nuevoEstado;
                } else {
                  this.mostrarToast(resultado.mensaje || 'Error cambiando estado', 'danger');
                }
              },
              (error: any) => {
                console.error('Error cambiando estado:', error);
                const mensaje = error.error?.mensaje || error.message || 'Error cambiando estado';
                this.mostrarToast(mensaje, 'danger');
              }
            );
          }
        }
      ]
    });
    
    await alert.present();
  }

  // Cerrar cuenta - CORREGIDO
  async cerrarCuenta() {
    if (!this.puedeBloquear || !this.cuenta) return;
    
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Cuenta',
      message: `¿Está seguro de cerrar la cuenta ${this.cuenta.numero}?<br><br>
               <strong>Requisitos:</strong><br>
               • Saldo debe ser 0<br>
               • No debe tener operaciones pendientes`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Verificar y Cerrar',
          handler: () => {
            this.cuentasService.cambiarEstado(this.cuenta.cuentaId, 'Cerrada').subscribe(
              (resultado: any) => {
                if (resultado.success) {
                  this.mostrarToast(resultado.mensaje, 'success');
                  this.cuenta.estado = 'Cerrada';
                } else {
                  this.mostrarToast(resultado.mensaje || 'No se puede cerrar la cuenta', 'danger');
                }
              },
              (error: any) => {
                console.error('Error cerrando cuenta:', error);
                const mensaje = error.error?.mensaje || error.message || 'Error cerrando cuenta';
                this.mostrarToast(mensaje, 'danger');
              }
            );
          }
        }
      ]
    });
    
    await alert.present();
  }

  // Formatear moneda
  formatoMoneda(monto: number, moneda: string): string {
    if (moneda === 'USD') {
      return `$${monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `₡${monto.toLocaleString('es-CR')}`;
    }
  }

  // Color por estado
  colorEstado(estado: string): string {
    switch (estado) {
      case 'Activa': return 'success';
      case 'Bloqueada': return 'danger';
      case 'Cerrada': return 'medium';
      default: return 'primary';
    }
  }

  // Icono por tipo
  iconoTipo(tipo: string): string {
    switch (tipo) {
      case 'Ahorros': return 'cash-outline';
      case 'Corriente': return 'card-outline';
      case 'Inversión': return 'trending-up-outline';
      case 'Plazo fijo': return 'timer-outline';
      default: return 'wallet-outline';
    }
  }

  // Mostrar toast
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Regresar
  regresar() {
    this.navCtrl.back();
  }
}