import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TabPageShellPetProfileComponent } from '../../shared/components/tab-page-shell-pet-profile';

@Component({
  selector: 'app-pet-profile',
  standalone: true,
  imports: [
    CommonModule,
    TabPageShellPetProfileComponent,
  ],
  templateUrl: './pet-profile.component.html',
  styleUrl: './pet-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetProfileComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
