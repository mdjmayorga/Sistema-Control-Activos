import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './loan-request.html',
  styleUrl: './loan-request.css'
})
export class LoanRequestComponent {
  loanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService
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
      const prestamo = {
        ...this.loanForm.value,
        estado: 'activo' as const,
        fechaPrestamo: new Date().toISOString(),
        usuarioId: 'usuario-prueba',
        usuarioNombre: 'Usuario Demo'
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