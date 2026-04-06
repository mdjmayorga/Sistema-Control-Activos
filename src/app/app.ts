import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserNavigationComponent } from './layout/components/sidebar/user-navigation/user-navigation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UserNavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}