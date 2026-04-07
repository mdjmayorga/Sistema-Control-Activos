import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/components/navbar/navbar';
import { UserNavigationComponent } from './layout/components/sidebar/user-navigation/user-navigation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UserNavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}