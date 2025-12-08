import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

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
  templateUrl: './pet-register.component.html',
  styleUrls: ['./pet-register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetRegisterComponent {
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

  constructor(private router: Router) {}

  /**
   * Navigate back to welcome-ai page
   */
  onBack(): void {
    this.router.navigate(['/home/welcome-ai']);
  }

  /**
   * Navigate to selected menu item
   */
  onMenuItemClick(item: { route: string }): void {
    this.router.navigate([item.route]);
  }
}
