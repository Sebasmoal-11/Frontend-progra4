// src/app/pages/login/login.page.ts - VERSIÓN CORREGIDA
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  AlertController, 
  ToastController 
} from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true, 
  imports: [IonicModule, CommonModule, FormsModule] 
})
export class LoginPage implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  
  loading = false;
  usuariosDemo: any[] = [];
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Obtener usuarios demo - PERO PRIMERO VAMOS A SIMULARLO
    this.cargarUsuariosDemo();
    
    // Cargar email guardado
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.credentials.email = savedEmail;
      this.rememberMe = true;
    }
  }

  // Método temporal mientras arreglamos getUsuariosDemo()
  cargarUsuariosDemo() {
    this.usuariosDemo = [
      { email: 'admin@banco.com', password: 'admin123', nombre: 'Administrador', rol: 'Administrador', cuentas: 2 },
      { email: 'cliente@banco.com', password: 'cliente123', nombre: 'Juan Pérez', rol: 'Cliente', cuentas: 2 },
      { email: 'gestor@banco.com', password: 'gestor123', nombre: 'María Rodríguez', rol: 'Gestor', cuentas: 1 },
      { email: 'test@test.com', password: 'test123', nombre: 'Usuario Prueba', rol: 'Cliente', cuentas: 2 }
    ];
  }

  async login() {
    // Validaciones básicas
    if (!this.credentials.email || !this.credentials.password) {
      this.showToast('Por favor ingrese email y contraseña', 'warning');
      return;
    }
    
    this.loading = true;
    
    // Guardar email si "recordar" está activado
    if (this.rememberMe) {
      localStorage.setItem('savedEmail', this.credentials.email);
    } else {
      localStorage.removeItem('savedEmail');
    }
    
    try {
      const success = await this.authService.login(
        this.credentials.email, 
        this.credentials.password
      );
      
      if (!success) {
        await this.showAlert(
          'Acceso Denegado',
          'Las credenciales no son válidas. Use uno de los usuarios de prueba.'
        );
      }
      // Si es exitoso, el authService ya redirige
      
    } catch (error) {
      console.error('Error en login:', error);
      await this.showAlert(
        'Error de Conexión',
        'No se pudo conectar. Use usuarios locales.'
      );
    } finally {
      this.loading = false;
    }
  }

  // Cargar usuario de prueba
  loadDemoUser(user: any) {
    this.credentials.email = user.email;
    this.credentials.password = user.password;
    
    // Auto-login después de medio segundo
    setTimeout(() => {
      this.login();
    }, 500);
  }

  // Mostrar información del usuario
  async showUserInfo(user: any) {
    const alert = await this.alertController.create({
      header: user.nombre,
      subHeader: `Rol: ${user.rol}`,
      message: `Email: ${user.email}<br>Contraseña: ${user.password}<br>Cuentas: ${user.cuentas}`,
      buttons: ['Cerrar']
    });
    
    await alert.present();
  }

  // Olvidé mi contraseña (simulado)
  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'En un sistema real, se enviaría un email de recuperación. Para pruebas, use los usuarios demo.',
      buttons: ['Entendido']
    });
    
    await alert.present();
  }

  // Mostrar toast
  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Mostrar alerta
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['Entendido']
    });
    await alert.present();
  }
}