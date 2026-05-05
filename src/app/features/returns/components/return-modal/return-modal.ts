import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-return-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './return-modal.html',
  styleUrl: './return-modal.css',
})
export class ReturnModal {
  @Input() abierto = false;
  @Input() loanId: string = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<{ productoDanado: boolean }>();
  productoDanado = false;
  numeroBotWhatsapp = environment.numeroBotWhatsapp;

  get whatsappDeepLink(): string {
    const mensaje = encodeURIComponent(`Reportar Daño ${this.loanId}`);
    return `https://wa.me/${this.numeroBotWhatsapp}?text=${mensaje}`;
  }

  get qrCodeUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.whatsappDeepLink)}`;
  }

  onCerrar(): void {
    this.productoDanado = false;
    this.cerrar.emit();
  }

  onCambioDanado(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.productoDanado = target.checked;
  }

  onConfirmar(): void {
    this.confirmar.emit({ productoDanado: this.productoDanado });
    this.productoDanado = false;
  }

}
