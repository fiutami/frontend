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
import { LogoComponent } from '../logo/logo.component';
import { MascotPeekComponent } from '../mascot-peek';
import { BottomTabBarComponent } from '../bottom-tab-bar/bottom-tab-bar.component';

// Config
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';

/**
 * TabPageShellYellowComponent
 *
 * Variante SENZA blue-shape e SENZA logo.
 * Sfondo giallo gradiente pulito.
 *
 * SLOTS DISPONIBILI:
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
  selector: 'app-tab-page-shell-yellow',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellComponent,
    AvatarButtonComponent,
    LogoComponent,
    MascotPeekComponent,
    BottomTabBarComponent,
  ],
  templateUrl: './tab-page-shell-yellow.component.html',
  styleUrls: ['./tab-page-shell-yellow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellYellowComponent {
  /** Titolo pagina */
  @Input() title = '';

  /** Mostra back button */
  @Input() showBack = true;

  /** ID della tab attiva nella bottom bar */
  @Input() activeTabId = 'home';

  /** Modalità avatar: pet o user */
  @Input() avatarMode: 'pet' | 'user' = 'pet';

  /** Emesso quando si clicca back */
  @Output() backClicked = new EventEmitter<void>();

  /** Tab bar configuration */
  protected readonly tabs = MAIN_TAB_BAR_CONFIG;

  onBack(): void {
    this.backClicked.emit();
  }
}
