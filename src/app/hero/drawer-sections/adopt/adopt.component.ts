import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

import { AdoptService, AdoptionAd, PetType } from '../../../core/services/adopt.service';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabPageShellDrawerComponent,
  ],
  templateUrl: './adopt.component.html',
  styleUrls: ['./adopt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdoptComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly adoptService = inject(AdoptService);
  private readonly translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerAdopt.title');

  adoptionAds = signal<AdoptionAd[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  /** Tracks which cards are expanded */
  readonly expandedCards = signal<Set<string>>(new Set());

  toggleCard(id: string): void {
    this.expandedCards.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedCards().has(id);
  }

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerAdopt.title');
    });
  }

  ngOnInit(): void {
    this.loadAdoptionAds();
  }

  goBack(): void {
    this.location.back();
  }

  loadAdoptionAds(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adoptService.getAdoptionAds().subscribe({
      next: (ads) => {
        this.adoptionAds.set(ads);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  retry(): void {
    this.loadAdoptionAds();
  }

  getPetTypeIcon(type: PetType): string {
    return this.adoptService.getPetTypeIcon(type);
  }

  formatRelativeTime(date: Date): string {
    return this.adoptService.formatRelativeTime(date);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available': return 'status--available';
      case 'pending': return 'status--pending';
      case 'adopted': return 'status--adopted';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return this.translate.instant('drawerAdopt.status.available');
      case 'pending': return this.translate.instant('drawerAdopt.status.pending');
      case 'adopted': return this.translate.instant('drawerAdopt.status.adopted');
      default: return status;
    }
  }

  contactOwner(ad: AdoptionAd): void {
    this.router.navigate(['/home/chat'], {
      queryParams: {
        adId: ad.id,
        subject: `Interessato a ${ad.petName}`,
      },
    });
  }

  viewDetails(ad: AdoptionAd): void {
    this.router.navigate(['/home/adopt', ad.id]);
  }
}
