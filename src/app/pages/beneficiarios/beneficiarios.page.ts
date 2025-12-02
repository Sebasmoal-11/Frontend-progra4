import { Component, OnInit } from '@angular/core';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { Beneficiario } from '../../models/models/types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-beneficiarios',
  templateUrl: './beneficiarios.page.html',
  styleUrls: ['./beneficiarios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class BeneficiariosPage implements OnInit {
  beneficiarios: Beneficiario[] = [];
  loading = false;

  constructor(private beneficiariosService: BeneficiariosService) {}

  ngOnInit() {
    this.cargarBeneficiarios();
  }

  async cargarBeneficiarios() {
    this.loading = true;
    try {
      const resultado = await this.beneficiariosService.obtenerBeneficiarios().toPromise();
      this.beneficiarios = resultado || [];
    } catch (error) {
      console.error('Error cargando beneficiarios:', error);
      // Datos de prueba
      this.beneficiarios = [
        {
          terceroBeneficiarioId: 1,
          clienteId: 1,
          alias: 'Juan Pérez',
          banco: 'BAC',
          numeroCuenta: '123456789012',
          moneda: 'CRC',
          pais: 'Costa Rica',
          estado: 'Activo',
          confirmado: true
        },
        {
          terceroBeneficiarioId: 2,
          clienteId: 1,
          alias: 'María López',
          banco: 'BN',
          numeroCuenta: '987654321098',
          moneda: 'USD',
          pais: 'Costa Rica',
          estado: 'Inactivo',
          confirmado: false
        }
      ];
    } finally {
      this.loading = false;
    }
  }

  nuevoBeneficiario() {
    // Aquí navegarías a un formulario de nuevo beneficiario
    console.log('Agregar nuevo beneficiario');
  }

  editarBeneficiario(beneficiario: Beneficiario) {
    console.log('Editar beneficiario:', beneficiario);
  }
}