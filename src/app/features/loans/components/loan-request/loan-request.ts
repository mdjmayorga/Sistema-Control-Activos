import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [PageLayout, ReactiveFormsModule, CommonModule, ConfirmModal],
  templateUrl: './loan-request.html',
  styleUrl: './loan-request.css'
})
export class LoanRequestComponent {
  titulo = 'Solicitar Prestamo';
  descripcion = 'Complete el formulario para registrar un nuevo prestamo de activo';
  modalConfirmacionAbierto = false;
  procesandoSolicitud = false;
  solicitudCompletada = false;
  loanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loanForm = this.fb.group({
      grupoTopografia: ['', Validators.required],
      cuadrilla: ['', Validators.required],
      razonPrestamo: ['', Validators.required],
      activo: ['', Validators.required],
      numeroSerie: ['', Validators.pattern(/^[A-Za-z0-9-]+$/)]
    });
  }

  onSubmit(): void {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }

    this.procesandoSolicitud = false;
    this.solicitudCompletada = false;
    this.modalConfirmacionAbierto = true;
  }

  cancelarConfirmacion(): void {
    if (this.procesandoSolicitud || this.solicitudCompletada) {
      return;
    }

    this.modalConfirmacionAbierto = false;
  }

  async confirmarSolicitud(): Promise<void> {
    if (this.procesandoSolicitud || this.solicitudCompletada) {
      return;
    }

    this.procesandoSolicitud = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.procesandoSolicitud = false;
      this.modalConfirmacionAbierto = false;
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
      this.procesandoSolicitud = false;
      this.solicitudCompletada = true;
      this.loanForm.reset();
      await this.esperar(900);

      const rutaMisPrestamos = this.router.url.startsWith('/admin')
        ? '/admin/mis-prestamos'
        : '/usuario/mis-prestamos';

      this.modalConfirmacionAbierto = false;
      await this.router.navigate([rutaMisPrestamos]);
    } catch (error) {
      this.procesandoSolicitud = false;
      this.modalConfirmacionAbierto = false;
      console.error('Error al registrar préstamo:', error);
    }
  }

  get modalTitulo(): string {
    if (this.solicitudCompletada) {
      return 'Prestamo realizado';
    }

    if (this.procesandoSolicitud) {
      return 'Registrando prestamo';
    }

    return 'Confirmar prestamo';
  }

  get modalMensaje(): string {
    if (this.solicitudCompletada) {
      return 'Se realizo el prestamo';
    }

    if (this.procesandoSolicitud) {
      return 'Realizando prestamo...';
    }

    return '¿Desea registrar este prestamo y continuar a Mis prestamos?';
  }

  get textoConfirmarModal(): string {
    if (this.solicitudCompletada) {
      return 'Listo';
    }

    if (this.procesandoSolicitud) {
      return 'Guardando...';
    }

    return 'Confirmar';
  }

  private async esperar(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  onCancel() {
    this.loanForm.reset();
  }
}