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
 * TabPageShellDefaultComponent
 *
 * Wrapper riutilizzabile che pre-riempie gli slot comuni di TabPageShell.
 * Usato da: Calendar, Map, Breeds, Species e altre pagine con layout standard.
 *
 * SLOTS DISPONIBILI:
 * - [shellBrandingExtra]: Contenuto extra sotto il logo (dentro blu) - es. data in calendar
 * - [shellStickyContent]: Contenuto sticky sotto il blu - es. quick actions, chips
 * - (default): Main content della pagina
 *
 * COMPONENTI AUTOMATICI:
 * - Back Button (controllato da showBack)
 * - Title (controllato da title)
 * - AvatarButton (controllato da avatarMode)
 * - Logo (sempre presente, responsive)
 * - MascotPeek (sempre presente)
 * - BottomTabBar (controllato da activeTabId)
 */
@Component({
  selector: 'app-tab-page-shell-default',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellComponent,
    AvatarButtonComponent,
    LogoComponent,
    MascotPeekComponent,
    BottomTabBarComponent,
  ],
  templateUrl: './tab-page-shell-default.component.html',
  styleUrls: ['./tab-page-shell-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellDefaultComponent {
  /** Titolo pagina */
  @Input() title = '';

  /** Mostra back button */
  @Input() showBack = true;

  /** ID della tab attiva nella bottom bar */
  @Input() activeTabId = 'home';

  /** Modalità avatar: pet o user */
  @Input() avatarMode: 'pet' | 'user' = 'pet';

  /** Variante background (default: tab-menu) */
  @Input() backgroundVariant: 'tab-menu' | 'blue-solid' | 'yellow-solid' | 'profile-pet' = 'tab-menu';

  /** Emesso quando si clicca back */
  @Output() backClicked = new EventEmitter<void>();

  /** Tab bar configuration */
  protected readonly tabs = MAIN_TAB_BAR_CONFIG;

  onBack(): void {
    this.backClicked.emit();
  }
}
