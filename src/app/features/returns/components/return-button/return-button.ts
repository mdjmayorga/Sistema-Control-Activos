import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-devolver-button',
  standalone: true,
  imports: [],
  templateUrl: './return-button.html',
  styleUrl: './return-button.css',
})
export class ReturnButton {
  @Output() returnClick = new EventEmitter<void>();

  onClick(): void {
    this.returnClick.emit();
  }
}
