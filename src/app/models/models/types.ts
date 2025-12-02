// Interfaces para los tipos de datos
export interface Cuenta {
  cuentaId: number;
  numeroCuenta: string;
  tipoCuenta: string;
  moneda: string;
  saldo: number;
  estadoCuenta: string;
  clienteId: number;
}

export interface Beneficiario {
  terceroBeneficiarioId: number;
  clienteId: number;
  alias: string;
  banco: string;
  numeroCuenta: string;
  moneda: string;
  pais: string;
  estado: string;
  confirmado: boolean;
}

export interface Transferencia {
  transferenciaId: number;
  clienteId: number;
  cuentaOrigenId: number;
  cuentaDestinoId?: number;
  terceroBeneficiarioId?: number;
  monto: number;
  moneda: string;
  fechaCreacion: string;
  fechaEjecucion: string;
  estado: string;
  esProgramada: boolean;
}

export interface Transaccion {
  transaccionCuentaId: number;
  cuentaId: number;
  clienteId: number;
  fecha: string;
  monto: number;
  descripcion: string;
  tipoOperacion: string;
  estadoOperacion: string;
  transferenciaId?: number;
  pagoServicioId?: number;
}
export interface Proveedor {
  proveedorServicioId: number;
  nombre: string;
  longitudMinContrato: number;
  longitudMaxContrato: number;
  reglasAdicionales?: string;
}

export interface PagoServicio {
  pagoServicioId: number;
  clienteId: number;
  proveedorServicioId: number;
  numeroContrato: string;
  monto: number;
  moneda: string;
  cuentaOrigenId: number;
  fechaCreacion: string;
  fechaEjecucion: string;
  esProgramado: boolean;
  estado: string;
  numeroReferencia: string;
  comision: number;
}