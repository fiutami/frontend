import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { AvatarButtonComponent } from '../../shared/components/avatar-button';
import { BreedsService } from '../../hero/breeds/breeds.service';
import { Species } from '../../hero/breeds/models/breed.model';

type ViewMode = 'species' | 'breeds';

@Component({
  selector: 'app-breeds-list',
  standalone: true,
  imports: [CommonModule, SharedModule, TranslateModule, AvatarButtonComponent],
  templateUrl: './breeds-list.component.html',
  styleUrls: ['./breeds-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly breedsService = inject(BreedsService);

  /** Species list from API */
  protected readonly species = this.breedsService.speciesList;

  /** Loading / error from service */
  protected readonly isLoading = this.breedsService.isLoading;
  protected readonly error = this.breedsService.error;

  /** Current view mode */
  protected viewMode = signal<ViewMode>('species');

  /** View mode labels */
  protected readonly viewLabels: Record<ViewMode, string> = {
    species: 'Specie',
    breeds: 'Razze',
  };

  /** Tab bar configuration */
  protected readonly tabs = [
    { id: 'home', icon: 'home', route: '/home' },
    { id: 'calendar', icon: 'calendar_today', route: '/calendar' },
    { id: 'location', icon: 'place', route: '/map' },
    { id: 'pet', icon: 'pets', route: '/pet' },
    { id: 'profile', icon: 'person', route: '/profile' },
  ];

  ngOnInit(): void {
    if (this.species().length === 0) {
      this.breedsService.loadSpecies().subscribe();
    }
  }

  get currentLabel(): string {
    return this.viewLabels[this.viewMode()];
  }

  onPreviousView(): void {
    this.viewMode.set(this.viewMode() === 'species' ? 'breeds' : 'species');
  }

  onNextView(): void {
    this.viewMode.set(this.viewMode() === 'species' ? 'breeds' : 'species');
  }

  onSpeciesClick(species: Species): void {
    this.router.navigate(['/breeds'], {
      queryParams: { species: species.id },
    });
  }

  onBack(): void {
    window.history.back();
  }

  onOpenDrawer(): void {
    console.log('Open drawer');
  }

  onRetry(): void {
    this.breedsService.error.set(null);
    this.breedsService.loadSpecies(true).subscribe();
  }

  isSmallLabel(label: string): boolean {
    return label.length > 6;
  }

  trackBySpeciesId(_index: number, species: Species): string {
    return species.id;
  }
}
