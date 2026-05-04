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
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ isDamaged: boolean }>();
  isDamaged = false;

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
