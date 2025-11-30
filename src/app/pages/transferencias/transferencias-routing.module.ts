import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferenciasPage } from './transferencias.page';

const routes: Routes = [
  {
    path: '',
    component: TransferenciasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferenciasPageRoutingModule {}
