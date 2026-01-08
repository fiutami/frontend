import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * WaitlistComponent - Display for users pending approval
 *
 * Shown when users register without an invitation code.
 * They are in a waitlist pending admin approval.
 */
@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaitlistComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
