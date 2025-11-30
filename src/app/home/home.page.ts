import { Component } from '@angular/core';
import { ApiService } from '../services/api';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ]
})
export class HomePage {

  mensaje: string = 'Probando conexión...';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.testConnection();
  }

  testConnection() {
    // Quitar "api/" de la ruta
    this.api.get('Cliente').subscribe({  // ← SOLO 'Cliente'
      next: (clientes) => {
        console.log('✅ Conexión exitosa:', clientes);
        this.mensaje = '✅ Conexión exitosa con el backend!';
      },
      error: (error) => {
        console.error('❌ Error de conexión:', error);
        this.mensaje = '❌ Error de conexión con el backend';
      }
    });
  }
}