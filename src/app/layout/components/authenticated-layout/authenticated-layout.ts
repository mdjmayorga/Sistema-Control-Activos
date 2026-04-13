import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, Navbar],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.css',
})
export class AuthenticatedLayout {
  protected readonly isNavbarCollapsed = signal(false);

  protected toggleNavbar(): void {
    this.isNavbarCollapsed.update((collapsed) => !collapsed);
  }
}
