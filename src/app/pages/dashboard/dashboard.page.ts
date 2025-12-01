import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
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
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Aquí cargarías datos reales del backend
    this.cuentasCount = 3;
    this.saldoTotal = 1500000;
  }

  logout() {
    this.authService.logout();
  }
}