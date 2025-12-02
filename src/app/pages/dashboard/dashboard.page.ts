import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Cuenta } from '../../services/auth';
import { CuentasService } from '../../services/cuentas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class DashboardPage implements OnInit {
  cuentasCount = 0;
  saldoTotal = 0;
  loading = true;
  usuarioActual: any;
  esAdmin = false;
  esGestor = false;
  esCliente = false;
  fechaActual = new Date();

  menuItems = [
    { title: 'Mis Cuentas', icon: 'card-outline', route: '/cuentas' },
    { title: 'Transferencias', icon: 'swap-horizontal-outline', route: '/transferencias' },
    { title: 'Beneficiarios', icon: 'people-outline', route: '/beneficiarios' },
    { title: 'Pagos', icon: 'receipt-outline', route: '/pagos' },
    { title: 'Historial', icon: 'time-outline', route: '/historial' },
    { title: 'Reportes', icon: 'document-text-outline', route: '/reportes' }
  ];

  constructor(
    private authService: AuthService,
    private cuentasService: CuentasService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarDatosUsuario();
    this.loadDashboardData();
  }

  cargarDatosUsuario() {
    this.usuarioActual = this.authService.getCurrentUser();
    this.esAdmin = this.usuarioActual?.rol === 'Administrador';
    this.esGestor = this.usuarioActual?.rol === 'Gestor';
    this.esCliente = this.usuarioActual?.rol === 'Cliente';
  }

  loadDashboardData() {
    this.loading = true;

    if (this.esAdmin || this.esGestor) {
      // Para admin/gestor: obtener todas las cuentas activas del sistema
      this.cuentasService.getAllCuentas().subscribe(
        (cuentas: any[]) => {
          // Filtrar solo cuentas activas
          const cuentasActivas = cuentas.filter(c => c.estado === 'Activa');
          this.cuentasCount = cuentasActivas.length;

          // Calcular saldo total de todas las cuentas activas
          this.saldoTotal = cuentasActivas.reduce((total, cuenta) => {
            return total + cuenta.saldo;
          }, 0);

          this.loading = false;
          console.log('Dashboard admin - Cuentas activas:', this.cuentasCount);
          console.log('Dashboard admin - Saldo total:', this.saldoTotal);
        },
        error => {
          console.error('Error cargando datos del dashboard:', error);
          this.cuentasCount = 0;
          this.saldoTotal = 0;
          this.loading = false;
        }
      );

    } else if (this.esCliente) {
      // Para cliente: obtener sus cuentas
      const clienteId = this.authService.getClienteId();
      if (clienteId) {
        this.cuentasService.getCuentasPorCliente(clienteId).subscribe(
          (cuentas: any[]) => {
            const cuentasActivas = cuentas.filter(c => c.estado === 'Activa');
            this.cuentasCount = cuentasActivas.length;
            this.saldoTotal = cuentasActivas.reduce((total, c) => total + c.saldo, 0);
            this.loading = false;
            console.log('Dashboard cliente - Cuentas activas:', this.cuentasCount);
            console.log('Dashboard cliente - Saldo total:', this.saldoTotal);
          },
          error => {
            console.error('Error cargando cuentas del cliente:', error);
            this.cuentasCount = 0;
            this.saldoTotal = 0;
            this.loading = false;
          }
        );
      } else {
        this.cuentasCount = 0;
        this.saldoTotal = 0;
        this.loading = false;
      }
    }
  }

  calcularSaldoTotal(cuentas: any[]): number {
    return cuentas
      .filter(c => c.estado === 'Activa')
      .reduce((total, cuenta) => total + cuenta.saldo, 0);
  }

  logout() {
    this.authService.logout();
  }
}