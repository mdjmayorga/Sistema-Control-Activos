import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-return-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './return-modal.html',
  styleUrl: './return-modal.css',
})
export class ReturnModal {
  @Input() abierto = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<{ productoDanado: boolean }>();
  productoDanado = false;

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
