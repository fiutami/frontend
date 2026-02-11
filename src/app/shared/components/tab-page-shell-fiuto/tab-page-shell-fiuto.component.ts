import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Shell base
import { TabPageShellComponent } from '../tab-page-shell/tab-page-shell.component';

// Componenti automatici
import { AvatarButtonComponent } from '../avatar-button/avatar-button.component';
import { MascotPeekComponent } from '../mascot-peek';
import { BottomTabBarComponent } from '../bottom-tab-bar/bottom-tab-bar.component';

// Config
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';

/**
 * TabPageShellFiutoComponent
 *
 * Variante con sfondo immagine Fiuto.
 * SENZA logo - per pagine che non necessitano del logo.
 *
 * SLOTS DISPONIBILI:
 * - [shellBrandingExtra]: Contenuto custom nell'area header
 * - [shellStickyContent]: Contenuto sticky sotto header
 * - (default): Main content della pagina
 *
 * COMPONENTI AUTOMATICI:
 * - Back Button (controllato da showBack)
 * - Title (controllato da title)
 * - AvatarButton (controllato da avatarMode)
 * - MascotPeek (sempre presente)
 * - BottomTabBar (controllato da activeTabId)
 */
@Component({
  selector: 'app-tab-page-shell-fiuto',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellComponent,
    AvatarButtonComponent,
    MascotPeekComponent,
    BottomTabBarComponent,
  ],
  templateUrl: './tab-page-shell-fiuto.component.html',
  styleUrls: ['./tab-page-shell-fiuto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellFiutoComponent {
  /** Titolo pagina */
  @Input() title = '';

  /** Mostra back button */
  @Input() showBack = false; // Default false per home

  /** ID della tab attiva nella bottom bar */
  @Input() activeTabId = 'home';

  /** Modalità avatar: pet o user */
  @Input() avatarMode: 'pet' | 'user' = 'pet';

  /** Nome immagine sfondo */
  @Input() imageName = 'auth-bg';

  /** Opacità overlay */
  @Input() overlayOpacity: 'none' | 'light' | 'medium' | 'dark' = 'light';

  /** Emesso quando si clicca back */
  @Output() backClicked = new EventEmitter<void>();

  /** Tab bar configuration */
  protected readonly tabs = MAIN_TAB_BAR_CONFIG;

  onBack(): void {
    this.backClicked.emit();
  }
}
