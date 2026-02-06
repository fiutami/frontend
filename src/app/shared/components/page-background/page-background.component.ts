import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PageBackground - UNICA fonte per sfondi pagina
 *
 * Varianti:
 * - 'image': Sfondo immagine (auth pages, home)
 * - 'tab-menu': Gradiente giallo→blu (tab menu pages standard)
 * - 'blue-solid': Blu solido (Breeds, etc.)
 * - 'yellow-solid': Gradiente giallo (profile pages)
 * - 'profile-pet': Variante pet profile
 *
 * REGOLA: Nessun componente deve definire gradienti di sfondo.
 * Usare sempre questo componente con la variante appropriata.
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
  /** Variante sfondo: gradient o image */
  @Input() variant: 'image' | 'tab-menu' | 'blue-solid' | 'yellow-solid' | 'profile-pet' = 'image';

  /** Nome immagine (solo per variant='image') */
  @Input() imageName = 'auth-bg';

  /** Opacità overlay (solo per variant='image') */
  @Input() overlayOpacity: 'none' | 'light' | 'medium' | 'dark' = 'light';

  /** Object fit (solo per variant='image') */
  @Input() objectFit: 'cover' | 'contain' = 'cover';

  get imagePath(): string {
    return `assets/images/${this.imageName}`;
  }

  get isImageVariant(): boolean {
    return this.variant === 'image';
  }
}
