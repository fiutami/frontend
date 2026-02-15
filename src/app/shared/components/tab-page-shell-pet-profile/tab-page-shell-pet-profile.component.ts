import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Shell base (clonato da Yellow)
import { TabPageShellComponent } from '../tab-page-shell/tab-page-shell.component';

// Componenti automatici (clonati da Yellow)
import { AvatarButtonComponent } from '../avatar-button/avatar-button.component';
import { LogoComponent } from '../logo/logo.component';
import { MascotPeekComponent } from '../mascot-peek';
import { BottomTabBarComponent } from '../bottom-tab-bar/bottom-tab-bar.component';
import { MascotBottomSheetComponent } from '../mascot-bottom-sheet/mascot-bottom-sheet.component';

// Config
import { MAIN_TAB_BAR_CONFIG } from '../../../core/config/tab-bar.config';

// AI
import { FiutoAiGlobalService } from '../../../core/services/fiuto-ai-global.service';
import { FiutoChatMessage } from '../../../core/models/fiuto-ai.models';

/**
 * TabPageShellPetProfileComponent
 *
 * Clone COMPLETO della variante Yellow + due forme aggiunte:
 * 1. Cerchio bianco (foto pet)
 * 2. Card blu / parallelepipedo (border-radius 92px top-left)
 *
 * SLOTS DISPONIBILI:
 * - [shellPetPhoto]: Contenuto nel cerchio bianco
 * - [shellHeaderAction]: Azioni extra nell'header (a sinistra dell'avatar)
 * - [shellStickyContent]: Contenuto sticky sotto header
 * - [shellQuickActions]: Colonna icone a destra
 * - [shellLeftActions]: FAB + dots a sinistra
 * - (default): Main content dentro la card blu
 *
 * COMPONENTI AUTOMATICI (da Yellow):
 * - Back Button (controllato da showBack)
 * - Title (controllato da title)
 * - AvatarButton (controllato da avatarMode, apre drawer)
 * - Logo (variant color, centrato nel header)
 * - MascotPeek (sempre presente) + MascotBottomSheet (Fiuto AI concierge)
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
    MascotBottomSheetComponent,
  ],
  templateUrl: './tab-page-shell-pet-profile.component.html',
  styleUrls: ['./tab-page-shell-pet-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellPetProfileComponent {
  private readonly fiutoAi = inject(FiutoAiGlobalService);

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

  /** Fiuto AI concierge state */
  showMascotSheet = signal(false);
  mascotMessages = signal<FiutoChatMessage[]>([]);
  mascotAiMessage = signal('');

  onBack(): void {
    this.backClicked.emit();
  }

  onMascotTapped(): void {
    this.mascotAiMessage.set(this.fiutoAi.contextualGreeting());
    this.showMascotSheet.set(true);
  }

  async onChatMessage(message: string): Promise<void> {
    const response = await this.fiutoAi.sendMessage(message);
    this.mascotMessages.set(this.fiutoAi.getHistory());
    this.mascotAiMessage.set(response);
  }

  onMascotSheetClosed(): void {
    this.showMascotSheet.set(false);
  }
}
