import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleCuentaPage } from './detalle-cuenta.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleCuentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleCuentaPageRoutingModule {}
