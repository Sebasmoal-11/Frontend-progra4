// src/app/pages/login/login.page.ts - VERSIÓN SIN DATOS DEMO
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
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Cargar email guardado
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.credentials.email = savedEmail;
      this.rememberMe = true;
    }
  }

  async login() {
  // Validaciones
  if (!this.credentials.email || !this.credentials.password) {
    this.showToast('Por favor ingrese email y contraseña', 'warning');
    return;
  }
  
  this.loading = true;
  
  try {
    const success = await this.authService.login(
      this.credentials.email, 
      this.credentials.password
    );
    
    if (!success) {
      this.showToast('Credenciales incorrectas', 'danger');
    }
    // Si es exitoso, el authService ya redirige automáticamente
    
  } catch (error: any) {
    console.error('Error en login:', error);
    this.showToast('Error de conexión', 'danger');
  } finally {
    this.loading = false;
  }
}

  // Olvidé mi contraseña
  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Contacte al administrador del sistema para recuperar su contraseña.',
      buttons: ['Entendido']
    });
    
    await alert.present();
  }

  // Validar formato email
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
}