import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CuentasPage } from './cuentas.page';

const routes: Routes = [
  {
    path: '',
    component: CuentasPage
  },  {
    path: 'apertura-cuenta',
    loadChildren: () => import('./apertura-cuenta/apertura-cuenta.module').then( m => m.AperturaCuentaPageModule)
  },
  {
    path: 'detalle-cuenta',
    loadChildren: () => import('./detalle-cuenta/detalle-cuenta.module').then( m => m.DetalleCuentaPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CuentasPageRoutingModule {}
