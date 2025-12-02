import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AperturaCuentaPageRoutingModule } from './apertura-cuenta-routing.module';

import { AperturaCuentaPage } from './apertura-cuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AperturaCuentaPageRoutingModule
  ],
  declarations: [AperturaCuentaPage]
})
export class AperturaCuentaPageModule {}
