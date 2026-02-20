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

// Shell Blue (sfondo blu solido, include: Avatar, Logo, MascotPeek, BottomTabBar)
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';

import { AdoptService, AdoptionAd, PetType } from '../../../core/services/adopt.service';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabPageShellBlueComponent,
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
