import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TabPageShellDefaultComponent } from '../../shared/components/tab-page-shell-default/tab-page-shell-default.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  userName = '';
  userEmail = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Utente';
      this.userEmail = user.email;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
