import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Shell base (clonato da Yellow)
import { TabPageShellComponent } from '../tab-page-shell/tab-page-shell.component';

// Componenti automatici (clonati da Yellow)
import { AvatarButtonComponent } from '../avatar-button/avatar-button.component';
import { LogoComponent } from '../logo/logo.component';
import { MascotPeekComponent } from '../mascot-peek';
import { BottomTabBarComponent } from '../bottom-tab-bar/bottom-tab-bar.component';

// Config
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';

/**
 * TabPageShellPetProfileComponent
 *
 * Clone COMPLETO della variante Yellow + due forme aggiunte:
 * 1. Cerchio bianco (foto pet)
 * 2. Card blu / parallelepipedo (border-radius 92px top-left)
 *
 * SLOTS DISPONIBILI:
 * - [shellPetPhoto]: Contenuto nel cerchio bianco
 * - [shellStickyContent]: Contenuto sticky sotto header
 * - (default): Main content dentro la card blu
 *
 * COMPONENTI AUTOMATICI (da Yellow):
 * - Back Button (controllato da showBack)
 * - Title (controllato da title)
 * - AvatarButton (controllato da avatarMode)
 * - Logo (variant color)
 * - MascotPeek (sempre presente)
 * - BottomTabBar (controllato da activeTabId)
 */
@Component({
  selector: 'app-tab-page-shell-pet-profile',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellComponent,
    AvatarButtonComponent,
    LogoComponent,
    MascotPeekComponent,
    BottomTabBarComponent,
  ],
  templateUrl: './tab-page-shell-pet-profile.component.html',
  styleUrls: ['./tab-page-shell-pet-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellPetProfileComponent {
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
