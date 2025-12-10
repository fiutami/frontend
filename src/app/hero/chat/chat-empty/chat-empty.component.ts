import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-chat-empty',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './chat-empty.component.html',
  styleUrls: ['./chat-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEmptyComponent {
  private router = inject(Router);

  goToHome(): void {
    this.router.navigate(['/home/main']);
  }

  goToExplore(): void {
    // Navigate to explore/discover feature
    // For now, go to home
    this.router.navigate(['/home/main']);
  }
}
