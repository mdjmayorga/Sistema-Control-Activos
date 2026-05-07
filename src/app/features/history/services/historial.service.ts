import { Injectable } from '@angular/core';
import { Loan } from '../../../core/models/loan.model';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  descargarCSV(loans: Loan[], nombreArchivo: string): void {
    const encabezados = [
      'Activo',
      'Número de serie',
      'Grupo',
      'Cuadrilla',
      'Razón del préstamo',
      'Usuario',
      'Correo institucional',
      'Estado',
      'Fecha de préstamo',
      'Fecha de devolución',
    ];

    const filas = loans.map((loan) => [
      loan.activo,
      loan.numeroSerie ?? '',
      loan.grupoTopografia,
      loan.cuadrilla,
      loan.razonPrestamo,
      loan.usuarioNombre,
      loan.correoInstitucional ?? '',
      loan.estado,
      this.formatearFecha(loan.fechaPrestamo),
      loan.fechaDevolucion ? this.formatearFecha(loan.fechaDevolucion) : '',
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map((celda) => this.escaparCelda(celda)).join(','))
      .join('\n');

    const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  private escaparCelda(valor: string): string {
    if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
      return `"${valor.replace(/"/g, '""')}"`;
    }
    return valor;
  }

  private formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${fecha.getFullYear()}`;
  }
}
