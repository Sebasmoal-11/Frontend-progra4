import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleCuentaPageRoutingModule } from './detalle-cuenta-routing.module';

import { DetalleCuentaPage } from './detalle-cuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleCuentaPageRoutingModule
  ],
  declarations: [DetalleCuentaPage]
})
export class DetalleCuentaPageModule {}
