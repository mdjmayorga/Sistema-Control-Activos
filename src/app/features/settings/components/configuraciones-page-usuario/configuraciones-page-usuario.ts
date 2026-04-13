import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { SettingsItem } from '../../../../shared/components/settings-item/settings-item';

@Component({
  selector: 'app-configuraciones-page-usuario',
  imports: [PageLayout, SettingsItem, ConfirmModal],
  templateUrl: './configuraciones-page-usuario.html',
  styleUrl: './configuraciones-page-usuario.css',
})
export class ConfiguracionesPageUsuario {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  titulo = 'Configuraciones';
  descripcion = 'Aqui el usuario podra gestionar sus configuraciones.';
  modalLogoutAbierto = false;

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
