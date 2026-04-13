import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('sistema-control-activos');
  protected readonly isNavbarCollapsed = signal(false);

  protected toggleNavbar(): void {
    this.isNavbarCollapsed.update((collapsed) => !collapsed);
  }
}
