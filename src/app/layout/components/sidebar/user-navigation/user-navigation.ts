import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-navigation.html',
  styleUrl: './user-navigation.css'
})
export class UserNavigationComponent {
  userRole: 'usuario' | 'admin' = 'usuario';
  userName: string = 'Usuario';

  constructor(private router: Router) {
    this.updateSidebarByRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSidebarByRoute(event.urlAfterRedirects);
      });
  }

  private updateSidebarByRoute(url: string): void {
    if (url.startsWith('/admin')) {
      this.userRole = 'admin';
      this.userName = 'Administrador';
    } else {
      this.userRole = 'usuario';
      this.userName = 'Usuario';
    }
  }
}