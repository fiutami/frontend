import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TabPageShellDefaultComponent } from '../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { SharedModule } from '../../shared/shared.module';

/**
 * PetRegisterComponent - Pet Registration Menu Page
 *
 * Main entry point for pet registration flow.
 * Shows 4 menu options: Specie, Dati anagrafici, Documentazioni, Guida al Benessere
 *
 * Based on Figma design: FxJsfOV7R7qoXBM2xTyXRE, node 12271:7592
 */
@Component({
  selector: 'app-pet-register',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent, SharedModule],
  templateUrl: './pet-register.component.html',
  styleUrls: ['./pet-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pet-register-page' }
})
export class PetRegisterComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** Page description text */
  readonly description = 'Completa queste informazioni per registrare il tuo animale e personalizzare Fiutami';

  /** Mascot speech bubble message */
  readonly mascotMessage = 'Per qualsiasi cosa, chiedi a me!';

  /** Menu items for pet registration flow */
  readonly menuItems = [
    { id: 'specie', label: 'Specie', route: '/home/pet-register/specie', icon: 'paw' as const },
    { id: 'details', label: 'Registra il tuo pets', route: '/home/pet-register/details', icon: 'paw' as const },
    { id: 'docs', label: 'Documentazioni', route: '/home/pet-register/docs', icon: 'paw' as const },
    { id: 'wellness', label: 'Guida al Benessere', route: '/home/pet-register/wellness', icon: 'paw' as const }
  ];

  /**
   * Navigate back using browser history
   * Works for both onboarding flow and drawer menu access
   */
  onBack(): void {
    this.location.back();
  }

  /**
   * Navigate to selected menu item
   */
  onMenuItemClick(item: { route: string }): void {
    this.router.navigate([item.route]);
  }
}
