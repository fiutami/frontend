import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabPageShellComponent } from '../tab-page-shell/tab-page-shell.component';

/**
 * TabPageShellDrawerComponent
 *
 * Shell leggera per le drawer pages (account, activity, saved, etc.).
 * Usa sfondo BLU solido, header con back + titolo.
 * NIENTE avatar, logo, mascot, tab bar.
 *
 * SLOTS DISPONIBILI:
 * - [shellStickyContent]: Contenuto sticky sotto header
 * - (default): Main content della pagina
 */
@Component({
  selector: 'app-tab-page-shell-drawer',
  standalone: true,
  imports: [CommonModule, TabPageShellComponent],
  templateUrl: './tab-page-shell-drawer.component.html',
  styleUrls: ['./tab-page-shell-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPageShellDrawerComponent {
  @Input() title = '';
  @Input() showBack = true;
  @Output() backClicked = new EventEmitter<void>();

  onBack(): void {
    this.backClicked.emit();
  }
}
