import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferenciasPageRoutingModule } from './transferencias-routing.module';

import { TransferenciasPage } from './transferencias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferenciasPageRoutingModule
  ],
  declarations: [TransferenciasPage]
})
export class TransferenciasPageModule {}
