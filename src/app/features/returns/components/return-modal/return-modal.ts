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
  @Input() open = false;
  @Input() loanId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ isDamaged: boolean }>();
  isDamaged = false;
  numeroBotWhatsapp = environment.numeroBotWhatsapp;

  get whatsappDeepLink(): string {
    const mensaje = encodeURIComponent(`Reportar Daño ${this.loanId}`);
    return `https://wa.me/${this.numeroBotWhatsapp}?text=${mensaje}`;
  }

  get qrCodeUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.whatsappDeepLink)}`;
  }

  onClose(): void {
    this.isDamaged = false;
    this.close.emit();
  }

  onDamagedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.isDamaged = target.checked;
  }

  onConfirm(): void {
    this.confirm.emit({ isDamaged: this.isDamaged });
    this.isDamaged = false;
  }
}
