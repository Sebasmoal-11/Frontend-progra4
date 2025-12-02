import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ModalController,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { BeneficiariosService } from '../../services/beneficiarios.service';

@Component({
  selector: 'app-beneficiarios',
  templateUrl: './beneficiarios.page.html',
  styleUrls: ['./beneficiarios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BeneficiariosPage implements OnInit {
  beneficiarios: any[] = [];
  loading = true;
  filtro = {
    searchTerm: '',
    estado: '',
    banco: ''
  };

  constructor(
    private authService: AuthService, // Agregado
    private beneficiariosService: BeneficiariosService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    await this.cargarBeneficiarios();
  }

  async cargarBeneficiarios() {
    this.loading = true;
    try {
      const usuario = this.authService.getCurrentUser();
      const clienteId = usuario?.clienteId;

      if (!clienteId) {
        throw new Error('No se pudo obtener el ID del cliente');
      }

      const resultado = await this.beneficiariosService.obtenerBeneficiarios(clienteId).toPromise();
      this.beneficiarios = resultado || [];

      if (this.beneficiarios.length === 0) {
        this.mostrarToast('No tienes beneficiarios registrados', 'info');
      }

    } catch (error: any) {
      console.error('Error cargando beneficiarios:', error);
      this.beneficiarios = [];
      this.mostrarToast(error.message || 'Error cargando beneficiarios', 'danger');
    } finally {
      this.loading = false;
    }
  }

  // Método para mostrar toast (agregado)
  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Método para agregar beneficiario
  async agregarBeneficiario() {
    // Tu lógica para agregar beneficiario
  }

  // Método para editar beneficiario
  async editarBeneficiario(beneficiario: any) {
    // Tu lógica para editar beneficiario
  }

  // Método para eliminar beneficiario
  async eliminarBeneficiario(beneficiario: any) {
    const confirm = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Está seguro de eliminar al beneficiario ${beneficiario.alias}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Eliminando beneficiario...'
            });
            await loading.present();

            try {
              // Lógica para eliminar del backend
              this.mostrarToast('Beneficiario eliminado exitosamente', 'success');
              await this.cargarBeneficiarios();
            } catch (error) {
              console.error('Error eliminando beneficiario:', error);
              this.mostrarToast('Error al eliminar beneficiario', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  /*
 async nuevoBeneficiario() {
   const modal = await this.modalCtrl.create({
     component: NuevoBeneficiarioPage, // Asegúrate de tener este componente
     componentProps: {}
   });
 
   modal.onDidDismiss().then((result) => {
     if (result.data?.success) {
       this.mostrarToast('Beneficiario agregado exitosamente', 'success');
       this.cargarBeneficiarios();
     }
   });
 
   await modal.present();
 }
 */

  // Método para confirmar beneficiario
  async confirmarBeneficiario(beneficiario: any) {
    const confirm = await this.alertCtrl.create({
      header: 'Confirmar Beneficiario',
      message: `¿Desea confirmar al beneficiario ${beneficiario.alias}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Confirmando beneficiario...'
            });
            await loading.present();

            try {
              // Lógica para confirmar en el backend
              this.mostrarToast('Beneficiario confirmado exitosamente', 'success');
              await this.cargarBeneficiarios();
            } catch (error) {
              console.error('Error confirmando beneficiario:', error);
              this.mostrarToast('Error al confirmar beneficiario', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  // Método para aplicar filtros
  aplicarFiltros() {
    // Tu lógica de filtrado
  }

  // Método para limpiar filtros
  limpiarFiltros() {
    this.filtro = {
      searchTerm: '',
      estado: '',
      banco: ''
    };
    this.cargarBeneficiarios();
  }

  // Método para formatear moneda
  formatearMoneda(moneda: string): string {
    return moneda === 'CRC' ? '₡' : '$';
  }

  // Método para color de estado
  colorEstado(estado: string): string {
    switch (estado) {
      case 'Activo': return 'success';
      case 'Inactivo': return 'danger';
      case 'Pendiente': return 'warning';
      default: return 'primary';
    }
  }

  // Refresh
  handleRefresh(event: any) {
    setTimeout(() => {
      this.cargarBeneficiarios();
      event.target.complete();
    }, 1000);
  }
}