import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileIconType, ProfileIconVariant } from './profile-icon.types';

/**
 * ProfileIconComponent - SVG icons for pet profile page
 *
 * Usage:
 * <app-profile-icon icon="calendar" variant="circular" ariaLabel="Calendario" (onClick)="navigate()"/>
 * <app-profile-icon icon="foto" variant="cta" ariaLabel="Gallery foto" (onClick)="openGallery()"/>
 *
 * Variants:
 * - circular: Blue 42x42 quick action icons (calendar, notifications, messages, bookmark, edit)
 * - cta: Golden gradient buttons with text (foto, friends, doc, breed)
 * - info: Info display boxes (age, pet_age, weight, sex) - non-interactive
 */
@Component({
  selector: 'app-profile-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileIconComponent {
  /** Icon type to display */
  icon = input.required<ProfileIconType>();

  /** Icon variant determines styling and size */
  variant = input<ProfileIconVariant>('circular');

  /** Accessible label for screen readers */
  ariaLabel = input<string>('');

  /** Label text for info boxes (displays dynamic data) */
  label = input<string>('');

  /** Whether the button is disabled */
  disabled = input<boolean>(false);

  /** Click event emitter */
  onClick = output<void>();

  /** Handle button click */
  handleClick(): void {
    if (!this.disabled()) {
      this.onClick.emit();
    }
  }
}
