import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ModalController,
  AlertController,
  ToastController,
  ActionSheetController
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService, Cuenta } from '../../services/auth';
import { CuentasService } from '../../services/cuentas.service';
import { AperturaCuentaPage } from './apertura-cuenta/apertura-cuenta.page';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CuentasPage implements OnInit {
  cuentas: any[] = [];
  todasLasCuentas: any[] = []; // Agregado
  loading = true;
  filtro = {
    tipo: '',
    moneda: '',
    estado: '',
    searchTerm: ''
  };

  usuarioActual: any;
  esAdmin = false;
  esGestor = false;
  esCliente = false;
  clientes: any[] = []; // Para admin

  constructor(
    private authService: AuthService,
    private cuentasService: CuentasService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.cargarDatosUsuario();
    await this.cargarClientes(); // Solo para admin
    await this.cargarCuentas();
  }

  async cargarDatosUsuario() {
    this.usuarioActual = this.authService.getCurrentUser();
    this.esAdmin = this.usuarioActual?.rol === 'Administrador';
    this.esGestor = this.usuarioActual?.rol === 'Gestor';
    this.esCliente = this.usuarioActual?.rol === 'Cliente';
  }

  async cargarClientes() {
    if (this.esAdmin) {
      this.authService.getClientes().subscribe(
        clientes => {
          this.clientes = clientes;
        },
        error => {
          console.error('Error cargando clientes:', error);
        }
      );
    }
  }

  async cargarCuentas() {
  this.loading = true;
  console.log('Cargando cuentas...');

  try {
    if (this.esAdmin || this.esGestor) {
      console.log('Usando getAllCuentas()');
      
      this.cuentasService.getAllCuentas().subscribe(
        (cuentas: any[]) => {
          console.log(`${cuentas.length} cuentas cargadas:`, cuentas);
          this.todasLasCuentas = cuentas;
          this.cuentas = [...cuentas];
          this.loading = false;
        },
        error => {
          console.error('Error en getAllCuentas:', error);
          this.mostrarToast('Error cargando cuentas', 'danger');
          this.loading = false;
        }
      );
      
    } else if (this.esCliente) {
      console.log('👤 Usando getCuentasPorCliente()');
      const usuario = this.authService.getCurrentUser();
      const clienteId = usuario?.clienteId;
      
      if (clienteId) {
        console.log(`Cliente ID: ${clienteId}`);
        
        this.cuentasService.getCuentasPorCliente(clienteId).subscribe(
          (cuentas: any[]) => {
            console.log(`${cuentas.length} cuentas del cliente:`, cuentas);
            this.cuentas = cuentas;
            this.loading = false;
          },
          error => {
            console.error('Error en getCuentasPorCliente:', error);
            this.mostrarToast('Error cargando sus cuentas', 'danger');
            this.loading = false;
          }
        );
      } else {
        console.log('Cliente sin ID');
        this.cuentas = [];
        this.loading = false;
        this.mostrarToast('No se encontró información del cliente', 'warning');
      }
    }
  } catch (error) {
    console.error('Error general:', error);
    this.loading = false;
  }
}

  // Filtrar cuentas - CORREGIDO
  aplicarFiltros() {
    if (this.esAdmin || this.esGestor) {
      this.cuentas = this.todasLasCuentas.filter(cuenta => {
        const searchLower = this.filtro.searchTerm.toLowerCase();
        return (
          (!this.filtro.tipo || cuenta.tipo === this.filtro.tipo) &&
          (!this.filtro.moneda || cuenta.moneda === this.filtro.moneda) &&
          (!this.filtro.estado || cuenta.estado === this.filtro.estado) &&
          (!this.filtro.searchTerm ||
            cuenta.numero.includes(searchLower) ||
            (cuenta.alias && cuenta.alias.toLowerCase().includes(searchLower)) ||
            (cuenta.clienteNombre && cuenta.clienteNombre.toLowerCase().includes(searchLower))
          )
        );
      });
    } else {
      this.cuentas = this.cuentas.filter(cuenta => {
        const searchLower = this.filtro.searchTerm.toLowerCase();
        return (
          (!this.filtro.tipo || cuenta.tipo === this.filtro.tipo) &&
          (!this.filtro.moneda || cuenta.moneda === this.filtro.moneda) &&
          (!this.filtro.estado || cuenta.estado === this.filtro.estado) &&
          (!this.filtro.searchTerm ||
            cuenta.numero.includes(searchLower) ||
            (cuenta.alias && cuenta.alias.toLowerCase().includes(searchLower))
          )
        );
      });
    }
  }

  // Limpiar filtros
  limpiarFiltros() {
    this.filtro = {
      tipo: '',
      moneda: '',
      estado: '',
      searchTerm: ''
    };
    this.cargarCuentas();
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

  // Icono por tipo de cuenta
  iconoTipo(tipo: string): string {
    switch (tipo) {
      case 'Ahorros': return 'cash-outline';
      case 'Corriente': return 'card-outline';
      case 'Inversión': return 'trending-up-outline';
      case 'Plazo fijo': return 'timer-outline';
      default: return 'wallet-outline';
    }
  }

  // Navegar a detalle
  verDetalle(cuenta: any) {
    this.router.navigate(['/detalle-cuenta', cuenta.numero]);
  }

  // Abrir modal para nueva cuenta
  async abrirNuevaCuenta() {
    if (!this.esAdmin && !this.esGestor) {
      this.mostrarToast('Solo administradores y gestores pueden abrir cuentas', 'warning');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: AperturaCuentaPage,
      componentProps: {
        clientes: this.clientes // Usamos los clientes cargados de la BD
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.mostrarToast('Cuenta abierta exitosamente', 'success');
        this.cargarCuentas();
      }
    });

    await modal.present();
  }

  // Acciones para admin en cuenta
  async mostrarAcciones(cuenta: any) {
    if (!this.esAdmin) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Cuenta: ${cuenta.numero}`,
      buttons: [
        {
          text: 'Ver Detalle',
          icon: 'eye-outline',
          handler: () => this.verDetalle(cuenta)
        },
        {
          text: cuenta.estado === 'Activa' ? 'Bloquear Cuenta' : 'Activar Cuenta',
          icon: cuenta.estado === 'Activa' ? 'lock-closed-outline' : 'lock-open-outline',
          handler: () => this.cambiarEstado(cuenta, cuenta.estado === 'Activa' ? 'Bloqueada' : 'Activa')
        },
        {
          text: 'Cerrar Cuenta',
          icon: 'close-circle-outline',
          handler: () => this.cambiarEstado(cuenta, 'Cerrada')
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Cambiar estado de cuenta - CORREGIDO
  async cambiarEstado(cuenta: any, nuevoEstado: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Está seguro de ${nuevoEstado.toLowerCase()} la cuenta ${cuenta.numero}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              const resultado = await this.cuentasService.cambiarEstado(cuenta.cuentaId, nuevoEstado).toPromise();
              this.mostrarToast('Estado cambiado exitosamente', 'success');
              this.cargarCuentas();
            } catch (error) {
              this.mostrarToast('Error cambiando estado de la cuenta', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Mostrar toast
  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Refresh
  handleRefresh(event: any) {
    setTimeout(() => {
      this.cargarCuentas();
      event.target.complete();
    }, 1000);
  }

  // Método para calcular saldo total
  calcularSaldoTotal(): number {
    return this.cuentas.reduce((sum, cuenta) => sum + cuenta.saldo, 0);
  }

  // Método para calcular saldo total por moneda
  calcularSaldoPorMoneda(moneda: string): number {
    return this.cuentas
      .filter(c => c.moneda === moneda)
      .reduce((sum, c) => sum + c.saldo, 0);
  }

  // Método para filtrar cuentas por moneda
  filtrarCuentasPorMoneda(moneda: string): any[] {
    return this.cuentas.filter(c => c.moneda === moneda);
  }
}