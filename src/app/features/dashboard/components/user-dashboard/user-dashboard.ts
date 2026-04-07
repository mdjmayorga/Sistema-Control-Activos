import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../../core/models/loan.model';
import { UserNavigationComponent } from '../../../../layout/components/sidebar/user-navigation/user-navigation';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboardComponent implements OnInit {
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