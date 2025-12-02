import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'transferencias',
    loadComponent: () => import('./pages/transferencias/transferencias.page').then(m => m.TransferenciasPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cuentas',
    loadComponent: () => import('./pages/cuentas/cuentas.page').then(m => m.CuentasPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
  {
  path: 'beneficiarios',
  loadComponent: () => import('./pages/beneficiarios/beneficiarios.page').then(m => m.BeneficiariosPage),
  canActivate: [AuthGuard]
},
{
  path: 'pagos',
  loadComponent: () => import('./pages/pagos/pagos.page').then(m => m.PagosPage),
  canActivate: [AuthGuard]
}, {
    path: 'beneficiarios',
    loadComponent: () => import('./pages/beneficiarios/beneficiarios.page').then(m => m.BeneficiariosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'pagos',
    loadComponent: () => import('./pages/pagos/pagos.page').then(m => m.PagosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cuentas',
    loadComponent: () => import('./pages/cuentas/cuentas.page').then(m => m.CuentasPage)
  },
  {
    path: 'detalle-cuenta/:numero',
    loadComponent: () => import('./pages/cuentas/detalle-cuenta/detalle-cuenta.page').then(m => m.DetalleCuentaPage)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }