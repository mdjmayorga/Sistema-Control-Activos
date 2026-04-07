import { Component, computed, input, output, signal, inject, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly username = input('Username_123');
  readonly collapsed = input(false);
  readonly toggleRequested = output<void>();
  readonly userRole = signal<'usuario' | 'admin'>('usuario');
  readonly isAdmin = computed(() => this.userRole() === 'admin');

  constructor() {
    this.updateRoleByRoute(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.updateRoleByRoute(event.urlAfterRedirects);
      });
  }

  private updateRoleByRoute(url: string): void {
    this.userRole.set(url.startsWith('/admin') ? 'admin' : 'usuario');
  }
}
