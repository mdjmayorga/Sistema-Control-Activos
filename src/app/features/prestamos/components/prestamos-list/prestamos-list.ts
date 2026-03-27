import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prestamo } from '../../models/prestamo';
import { PrestamoItem } from '../prestamo-item/prestamo-item';

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [CommonModule, PrestamoItem],
  templateUrl: './prestamos-list.html',
  styleUrl: './prestamos-list.css',
})
export class PrestamosList {
  @Input() prestamos: Prestamo[] = [];

}
