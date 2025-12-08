import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';

/**
 * MenuItemComponent - Reusable menu item with icon and label
 *
 * Used in pet registration flow and other menu-based pages.
 * Features a paw icon on the left and chevron on the right.
 */
@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  @Input() label = '';
  @Input() icon: 'paw' | 'document' | 'heart' | 'info' | 'custom' = 'paw';
  @Input() disabled = false;
  @Input() showChevron = true;

  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
