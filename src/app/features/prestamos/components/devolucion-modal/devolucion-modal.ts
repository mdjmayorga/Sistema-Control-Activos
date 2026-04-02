import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-devolucion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devolucion-modal.html',
  styleUrl: './devolucion-modal.css',
})
export class DevolucionModal {
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
