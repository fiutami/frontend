import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBackgroundComponent } from '../page-background/page-background.component';

/**
 * TabPageShellComponent - Telaio standard per tab menu pages
 *
 * REGOLE:
 * - NON conosce tabs! Solo layout + slots
 * - Tab bar passata via slot [shellFooter]
 * - Background gestito da PageBackgroundComponent
 * - Header con back button opzionale
 *
 * SLOTS DISPONIBILI:
 * - [shellHeaderRight]: Avatar, icone azioni
 * - [shellBranding]: Logo + date/subtitle
 * - [shellFooter]: Tab bar, mascot
 * - (default): Main content
 *
 * ESEMPIO USO:
 * ```html
 * <app-tab-page-shell title="Calendario" backgroundVariant="tab-menu">
 *   <app-avatar-button shellHeaderRight />
 *   <div shellBranding>Logo + Date</div>
 *   <!-- contenuto principale -->
 *   <app-bottom-tab-bar shellFooter />
 * </app-tab-page-shell>
 * ```
 */
@Component({
  selector: 'app-tab-page-shell',
  standalone: true,
  imports: [CommonModule, PageBackgroundComponent],
  templateUrl: './tab-page-shell.component.html',
  styleUrls: ['./tab-page-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellComponent {
  /** Titolo header */
  @Input() title = '';

  /** Mostra back button */
  @Input() showBack = true;

  /** Variante background */
  @Input() backgroundVariant: 'tab-menu' | 'blue-solid' | 'yellow-solid' | 'profile-pet' = 'tab-menu';

  /** Emesso quando si clicca back */
  @Output() backClicked = new EventEmitter<void>();

  onBackClick(): void {
    this.backClicked.emit();
  }
}
