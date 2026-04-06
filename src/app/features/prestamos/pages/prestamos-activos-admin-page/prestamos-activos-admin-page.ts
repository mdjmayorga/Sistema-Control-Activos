import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../../core/models/loan.model';

@Component({
  selector: 'app-prestamos-activos-admin-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prestamos-activos-admin-page.html',
  styleUrl: './prestamos-activos-admin-page.css'
})
export class PrestamosActivosAdminPage implements OnInit {
  prestamosActivos: Loan[] = [];
  cargando = true;

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loanService.obtenerPrestamosActivos().subscribe({
      next: (data) => {
        this.prestamosActivos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener préstamos activos:', error);
        this.cargando = false;
      }
    });
  }
}