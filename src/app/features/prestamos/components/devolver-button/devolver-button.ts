import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-devolver-button',
  standalone: true,
  imports: [],
  templateUrl: './devolver-button.html',
  styleUrl: './devolver-button.css',
})
export class DevolverButton {
  @Output() devolverClick = new EventEmitter<void>();

  onClick(): void {
    this.devolverClick.emit();
  }
}
