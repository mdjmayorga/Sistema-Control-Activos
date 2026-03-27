import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestamo } from '../../models/prestamo';

@Component({
  selector: 'app-prestamo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prestamo-item.html',
  styleUrl: './prestamo-item.css',
})
export class PrestamoItem {
  @Input() prestamo!: Prestamo;
}
