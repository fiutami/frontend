import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * AuthCardComponent - Reusable auth card container
 *
 * Provides consistent styling for authentication forms with:
 * - Semi-transparent white background
 * - Rounded corners
 * - Shadow elevation
 * - Responsive padding
 */
@Component({
  selector: 'app-auth-card',
  templateUrl: './auth-card.component.html',
  styleUrls: ['./auth-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCardComponent { }
