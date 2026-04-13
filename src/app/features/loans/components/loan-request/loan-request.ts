import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan.service';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [PageLayout, ReactiveFormsModule, CommonModule],
  templateUrl: './loan-request.html',
  styleUrl: './loan-request.css'
})
export class LoanRequestComponent {
  titulo = 'Solicitar Prestamo';
  descripcion = 'Complete el formulario para registrar un nuevo prestamo de activo';
  loanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private authService: AuthService,
  ) {
    this.loanForm = this.fb.group({
      grupoTopografia: ['', Validators.required],
      cuadrilla: ['', Validators.required],
      razonPrestamo: ['', Validators.required],
      activo: ['', Validators.required],
      numeroSerie: ['', Validators.pattern(/^[A-Za-z0-9-]+$/)]
    });
  }

  async onSubmit() {
    if (this.loanForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        alert('Debe iniciar sesion para registrar un prestamo');
        return;
      }

      const usuarioNombre = await this.authService.getUserDisplayName(
        currentUser.uid,
        currentUser.displayName,
        currentUser.email,
      );

      const prestamo = {
        ...this.loanForm.value,
        estado: 'activo' as const,
        fechaPrestamo: new Date().toISOString(),
        usuarioId: currentUser.uid,
        usuarioNombre,
      };

      try {
        await this.loanService.crearPrestamo(prestamo);
        alert('Solicitud registrada correctamente');
        this.loanForm.reset();
      } catch (error) {
        console.error('Error al registrar préstamo:', error);
        alert('Ocurrió un error al registrar el préstamo');
      }
    } else {
      this.loanForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.loanForm.reset();
  }
}