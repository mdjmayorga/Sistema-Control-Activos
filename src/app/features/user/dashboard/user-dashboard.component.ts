import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent implements OnInit {
  private auth = inject(Auth);
  private authService = inject(AuthService);
  private router = inject(Router);

  userEmail = signal<string | null>(null);

  ngOnInit(): void {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.userEmail.set(currentUser.email);
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
