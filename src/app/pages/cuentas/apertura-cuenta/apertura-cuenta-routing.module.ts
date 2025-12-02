import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AperturaCuentaPage } from './apertura-cuenta.page';

const routes: Routes = [
  {
    path: '',
    component: AperturaCuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AperturaCuentaPageRoutingModule {}
