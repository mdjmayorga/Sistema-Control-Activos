import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);

  resetEmail = signal('');
  resetLoading = signal(false);
  resetError = signal('');
  resetSuccess = signal('');

  async submitPasswordReset(): Promise<void> {
    const email = this.resetEmail().trim();
    if (!email) {
      this.resetError.set('Ingrese su correo institucional.');
      return;
    }

    this.resetLoading.set(true);
    this.resetError.set('');
    this.resetSuccess.set('');

    try {
      const message = await this.authService.resetPassword(email);
      this.resetSuccess.set(message);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'functions/not-found') {
        this.resetError.set('No existe una cuenta con este correo.');
      } else if (code === 'functions/unavailable' || code === 'functions/internal') {
        this.resetError.set('El servicio no está disponible. Intente más tarde.');
      } else {
        this.resetError.set(err?.message ?? 'Ocurrió un error. Intente de nuevo.');
      }
    } finally {
      this.resetLoading.set(false);
    }
  }
}
