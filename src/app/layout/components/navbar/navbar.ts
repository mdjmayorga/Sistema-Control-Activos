import { Component, computed, input, output, signal, inject, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly firestore = inject(Firestore);

  readonly username = input<string | null>(null);
  readonly collapsed = input(false);
  readonly toggleRequested = output<void>();
  readonly userRole = signal<'usuario' | 'admin'>('usuario');
  readonly sessionUsername = signal('Usuario');
  readonly isAdmin = computed(() => this.userRole() === 'admin');
  readonly displayUsername = computed(() => this.username() ?? this.sessionUsername());

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

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentUser) => {
        if (!currentUser) {
          this.sessionUsername.set('Usuario');
          return;
        }

        this.sessionUsername.set(this.formatNameFallback(currentUser.displayName, currentUser.email));
        void this.loadProfileName(currentUser.uid);
      });
  }

  private async loadProfileName(uid: string): Promise<void> {
    try {
      const snap = await getDoc(doc(this.firestore, `users/${uid}`));
      if (!snap.exists()) return;

      const data = snap.data() as Record<string, unknown>;
      const rawName = data['fullName'] ?? data['nombre'] ?? data['name'];

      if (typeof rawName === 'string' && rawName.trim()) {
        this.sessionUsername.set(rawName.trim());
      }
    } catch {
    }
  }

  private formatNameFallback(displayName: string | null, email: string | null): string {
    if (displayName && displayName.trim()) return displayName.trim();
    if (!email) return 'Usuario';

    const alias = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() ?? '';
    if (!alias) return 'Usuario';

    return alias
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private updateRoleByRoute(url: string): void {
    this.userRole.set(url.startsWith('/admin') ? 'admin' : 'usuario');
  }
}
