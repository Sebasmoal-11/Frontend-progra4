import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor() { }

  generarPDF(titulo: string, datos: any[], columnas: string[]): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text(titulo, 14, 15);
    
    // Tabla
    (doc as any).autoTable({
      startY: 20,
      head: [columnas],
      body: datos.map(row => columnas.map(col => row[col] || ''))
    });

    // Guardar
    doc.save(`${titulo.toLowerCase().replace(' ', '_')}_${new Date().getTime()}.pdf`);
  }

  generarCSV(titulo: string, datos: any[], columnas: string[]): void {
    const csv = Papa.unparse({
      fields: columnas,
      data: datos.map(row => columnas.map(col => row[col] || ''))
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${titulo.toLowerCase().replace(' ', '_')}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generarComprobanteTransferencia(transferencia: any): void {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('COMPROBANTE DE TRANSFERENCIA', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Número de Referencia: TRF-${transferencia.transferenciaId}`, 14, 30);
    doc.text(`Fecha: ${new Date(transferencia.fechaCreacion).toLocaleDateString()}`, 14, 40);
    doc.text(`Monto: ₡${transferencia.monto.toLocaleString()}`, 14, 50);
    doc.text(`Comisión: ₡${transferencia.comision?.toLocaleString() || '0'}`, 14, 60);
    doc.text(`Total Débito: ₡${(transferencia.monto + (transferencia.comision || 0)).toLocaleString()}`, 14, 70);
    doc.text(`Estado: ${transferencia.estado}`, 14, 80);
    
    doc.save(`comprobante_transferencia_${transferencia.transferenciaId}.pdf`);
  }

  generarExtractoCuenta(cuenta: any, transacciones: any[]): void {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(16);
    doc.text('EXTRACTO DE CUENTA', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Cuenta: ${cuenta.numeroCuenta}`, 14, 30);
    doc.text(`Cliente: ${cuenta.clienteId}`, 14, 40);
    doc.text(`Período: ${new Date().toLocaleDateString()}`, 14, 50);
    
    // Tabla de transacciones
    const columnas = ['Fecha', 'Descripción', 'Débito', 'Crédito', 'Saldo'];
    const datos = transacciones.map(tx => [
      new Date(tx.fecha).toLocaleDateString(),
      tx.descripcion || 'Transacción',
      tx.monto < 0 ? `₡${Math.abs(tx.monto).toLocaleString()}` : '',
      tx.monto > 0 ? `₡${tx.monto.toLocaleString()}` : '',
      `₡${tx.saldoResultante?.toLocaleString() || '0'}`
    ]);
    
    (doc as any).autoTable({
      startY: 60,
      head: [columnas],
      body: datos
    });
    
    doc.save(`extracto_${cuenta.numeroCuenta}_${new Date().getTime()}.pdf`);
  }
}
