import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { SettingsItem } from '../../../../shared/components/settings-item/settings-item';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-configuraciones-page-usuario',
  imports: [PageLayout, SettingsItem, ConfirmModal, ReactiveFormsModule],
  templateUrl: './configuraciones-page-usuario.html',
  styleUrl: './configuraciones-page-usuario.css',
})
export class ConfiguracionesPageUsuario {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  titulo = 'Configuraciones';
  descripcion = 'Aqui el usuario podra gestionar sus configuraciones.';
  modalLogoutAbierto = false;

  modalCambioAbierto = false;
  cambioLoading = false;
  cambioError = '';
  cambioExito = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  cambioForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmNewPassword') }
  );

  abrirModalCambio(): void {
    this.cambioForm.reset();
    this.cambioError = '';
    this.cambioExito = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmNewPassword = false;
    this.modalCambioAbierto = true;
  }

  cerrarModalCambio(): void {
    this.modalCambioAbierto = false;
  }

  async submitCambioContrasena(): Promise<void> {
    if (this.cambioForm.invalid) {
      this.cambioForm.markAllAsTouched();

      if (this.cambioForm.hasError('passwordMismatch')) {
        this.cambioError = 'Las contraseñas nuevas no coinciden.';
        return;
      }
      if (this.cambioForm.controls.newPassword.hasError('minlength')) {
        this.cambioError = 'La nueva contraseña debe tener al menos 8 caracteres.';
        return;
      }
      this.cambioError = 'Complete todos los campos.';
      return;
    }

    this.cambioLoading = true;
    this.cambioError = '';
    this.cambioExito = '';

    try {
      await this.authService.changePassword(
        this.cambioForm.value.currentPassword!,
        this.cambioForm.value.newPassword!
      );
      this.cambioExito = 'Contraseña actualizada correctamente.';
      this.cambioForm.reset();
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.cambioError = 'La contraseña actual es incorrecta.';
      } else {
        this.cambioError = 'Ocurrió un error. Intente de nuevo.';
      }
    } finally {
      this.cambioLoading = false;
    }
  }

  solicitarLogout(): void {
    this.modalLogoutAbierto = true;
  }

  cancelarLogout(): void {
    this.modalLogoutAbierto = false;
  }

  async confirmarLogout(): Promise<void> {
    this.modalLogoutAbierto = false;

    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
