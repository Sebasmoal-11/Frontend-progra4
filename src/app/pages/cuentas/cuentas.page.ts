import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ModalController,
  AlertController,
  ToastController,
  ActionSheetController,
  LoadingController
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
    private loadingCtrl: LoadingController,
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

  // Cambiar estado de cuenta
  async cambiarEstado(cuenta: any, nuevoEstado: string) {
  console.log(`Intentando cambiar cuenta ${cuenta.numero} a estado: ${nuevoEstado}`);
  console.log('Estado actual:', cuenta.estado);
  console.log('Saldo actual:', cuenta.saldo);

  // Validaciones específicas
  if (nuevoEstado === 'Cerrada') {
    // Verificar si la cuenta está bloqueada
    if (cuenta.estado === 'Bloqueada') {
      const alertBloqueada = await this.alertCtrl.create({
        header: 'No se puede cerrar',
        message: `La cuenta ${cuenta.numero} está BLOQUEADA.<br><br>
                 Para cerrar la cuenta, primero debe ACTIVARLA y luego cerrarla.<br><br>
                 <strong>Flujo correcto:</strong><br>
                 1. Activar la cuenta<br>
                 2. Cerrar la cuenta`,
        buttons: ['Entendido']
      });
      await alertBloqueada.present();
      return;
    }

    // Verificar si tiene saldo
    if (cuenta.saldo !== 0) {
      const alertSaldo = await this.alertCtrl.create({
        header: 'No se puede cerrar',
        message: `La cuenta ${cuenta.numero} tiene saldo de ${this.formatoMoneda(cuenta.saldo, cuenta.moneda)}.<br><br>
                 Para cerrar la cuenta, primero debe transferir o retirar todo el saldo.`,
        buttons: ['Entendido']
      });
      await alertSaldo.present();
      return;
    }
  }

  // Para activar una cuenta bloqueada
  if (nuevoEstado === 'Activa' && cuenta.estado === 'Bloqueada') {
    const confirmActivar = await this.alertCtrl.create({
      header: 'Activar Cuenta Bloqueada',
      message: `¿Está seguro de activar la cuenta ${cuenta.numero}?<br><br>
               La cuenta está actualmente BLOQUEADA.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Activar',
          handler: () => {
            this.ejecutarCambioEstado(cuenta.cuentaId, nuevoEstado, cuenta);
          }
        }
      ]
    });
    await confirmActivar.present();
    return;
  }

  // Confirmación normal para otros cambios
  const confirmAlert = await this.alertCtrl.create({
    header: 'Confirmar',
    message: `¿Está seguro de ${nuevoEstado.toLowerCase()} la cuenta ${cuenta.numero}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Confirmar',
        handler: () => {
          this.ejecutarCambioEstado(cuenta.cuentaId, nuevoEstado, cuenta);
        }
      }
    ]
  });

  await confirmAlert.present();
}

// Método separado para ejecutar el cambio
private async ejecutarCambioEstado(cuentaId: number, estado: string, cuenta: any) {
  try {
    const resultado = await this.cuentasService.cambiarEstado(cuentaId, estado).toPromise();
    this.mostrarToast('Estado cambiado exitosamente', 'success');
    
    // Si se activó una cuenta bloqueada, sugerir cerrarla si tiene saldo 0
    if (estado === 'Activa' && cuenta.estado === 'Bloqueada' && cuenta.saldo === 0) {
      setTimeout(() => {
        this.sugerirCerrarCuenta(cuenta);
      }, 1000);
    }
    
    this.cargarCuentas();
  } catch (error: any) {
    this.mostrarToast(error.message || 'Error cambiando estado de la cuenta', 'danger');
  }
}

// Método para sugerir cerrar una cuenta que fue activada y tiene saldo 0
private async sugerirCerrarCuenta(cuenta: any) {
  const sugerenciaAlert = await this.alertCtrl.create({
    header: 'Sugerencia',
    message: `La cuenta ${cuenta.numero} ha sido activada y tiene saldo 0.<br><br>
             ¿Desea cerrar la cuenta ahora?`,
    buttons: [
      {
        text: 'No, más tarde',
        role: 'cancel'
      },
      {
        text: 'Sí, cerrar',
        handler: () => {
          this.cambiarEstado(cuenta, 'Cerrada');
        }
      }
    ]
  });
  
  await sugerenciaAlert.present();
}

  async eliminarCuenta(cuenta: any) {
    if (cuenta.saldo !== 0) {
      const alertNoSaldo = await this.alertCtrl.create({
        header: 'No se puede eliminar',
        message: `La cuenta ${cuenta.numero} tiene saldo de ${this.formatoMoneda(cuenta.saldo, cuenta.moneda)}.<br><br>
               Para eliminar la cuenta, primero debe transferir o retirar todo el saldo.`,
        buttons: ['Entendido']
      });
      await alertNoSaldo.present();
      return;
    }

    if (cuenta.estado !== 'Cerrada') {
      const alertNoCerrada = await this.alertCtrl.create({
        header: 'No se puede eliminar',
        message: `La cuenta ${cuenta.numero} tiene estado "${cuenta.estado}".<br><br>
               Para eliminar la cuenta, primero debe cerrarla.`,
        buttons: ['Entendido']
      });
      await alertNoCerrada.present();
      return;
    }

    // Si cumple las condiciones, mostrar confirmación
    const confirmacionAlert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar la cuenta ${cuenta.numero}?<br><br>
             <strong>Esta acción no se puede deshacer.</strong><br><br>
             <strong>Datos de la cuenta:</strong><br>
             • Número: ${cuenta.numero}<br>
             • Saldo: ${this.formatoMoneda(cuenta.saldo, cuenta.moneda)}<br>
             • Estado: ${cuenta.estado}<br>
             • Tipo: ${cuenta.tipo}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.ejecutarEliminacion(cuenta);
          }
        }
      ]
    });

    await confirmacionAlert.present();
  }
  //Eliminar cuenta 
  private async ejecutarEliminacion(cuenta: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando cuenta...'
    });
    await loading.present();

    try {
      const resultado = await this.cuentasService.eliminarCuenta(cuenta.cuentaId).toPromise();

      await loading.dismiss();

      if (resultado.success) {
        this.mostrarToast(resultado.mensaje, 'success');
        this.cargarCuentas(); // Recargar la lista
      }
    } catch (error: any) {
      await loading.dismiss();
      this.mostrarToast(error.message || 'Error al eliminar la cuenta', 'danger');
    }
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