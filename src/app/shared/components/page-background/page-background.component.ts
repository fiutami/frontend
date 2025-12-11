import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PageBackground - Full-page background with image and overlay
 *
 * Features:
 * - Responsive images (AVIF, WebP, PNG fallback)
 * - Configurable overlay opacity
 * - Mobile-first responsive sizing
 * - Used by auth pages and home
 */
@Component({
  selector: 'app-page-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-background.component.html',
  styleUrls: ['./page-background.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBackgroundComponent {
  @Input() imageName = 'auth-bg';
  @Input() overlayOpacity: 'none' | 'light' | 'medium' | 'dark' = 'light';
  @Input() objectFit: 'cover' | 'contain' = 'cover';

  get imagePath(): string {
    return `assets/images/${this.imageName}`;
  }
}
