import { Component, OnInit } from '@angular/core';
import { CuentasService } from '../../services/cuentas.service';
import { TransferenciasService } from '../../services/transferencias.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { Cuenta, Beneficiario, Transferencia } from '../../models/models/types';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-transferencias',
  templateUrl: './transferencias.page.html',
  styleUrls: ['./transferencias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] 
})
export class TransferenciasPage implements OnInit {
  segment = 'nueva';
  cuentas: Cuenta[] = [];
  beneficiarios: Beneficiario[] = [];
  historialTransferencias: Transferencia[] = [];

  
  tipoDestino = 'propia';
  loading = false;
  
  transferencia = {
    cuentaOrigenId: null as number | null,
    cuentaDestinoId: null as number | null,
    terceroBeneficiarioId: null as number | null,
    monto: 0,
    moneda: 'CRC',
    esProgramada: false,
    fechaEjecucion: new Date().toISOString(),
    idempotencyKey: this.generateIdempotencyKey()
  };

  minDate = new Date().toISOString();
  maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  constructor(
    private cuentasService: CuentasService,
    private transferenciasService: TransferenciasService,
    private beneficiariosService: BeneficiariosService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
  try {
    const cuentasResult = await this.cuentasService.obtenerCuentas().toPromise();
    const beneficiariosResult = await this.beneficiariosService.obtenerBeneficiarios().toPromise();
    const transferenciasResult = await this.transferenciasService.obtenerTransferencias(1).toPromise();
    
    this.cuentas = cuentasResult || []; // Si es undefined, usar array vacío
    this.beneficiarios = beneficiariosResult || []; // Si es undefined, usar array vacío
    this.historialTransferencias = transferenciasResult || []; // Si es undefined, usar array vacío
  } catch (error) {
    console.error('Error cargando datos:', error);
    // En caso de error, inicializar arrays vacíos
    this.cuentas = [];
    this.beneficiarios = [];
    this.historialTransferencias = [];
  }
}

  cambiarTipoDestino() {
    this.transferencia.cuentaDestinoId = null;
    this.transferencia.terceroBeneficiarioId = null;
  }

  generateIdempotencyKey(): string {
    return `trf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async crearTransferencia() {
    this.loading = true;
    
    try {
      await this.transferenciasService.crearTransferencia(this.transferencia).toPromise();
      // Mostrar mensaje de éxito
      this.cargarDatos(); // Recargar historial
      this.segment = 'historial';
    } catch (error) {
      console.error('Error creando transferencia:', error);
      // Mostrar error
    } finally {
      this.loading = false;
    }
  }

  async cancelarTransferencia(id: number) {
    try {
      await this.transferenciasService.cancelarTransferencia(id).toPromise();
      this.cargarDatos(); // Recargar historial
    } catch (error) {
      console.error('Error cancelando transferencia:', error);
    }
  }

  segmentChanged() {
    if (this.segment === 'historial') {
      this.cargarDatos();
    }
  }
}