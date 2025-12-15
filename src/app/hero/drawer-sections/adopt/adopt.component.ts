import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AdoptService, AdoptionAd, PetType } from '../../../core/services/adopt.service';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adopt.component.html',
  styleUrls: ['./adopt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdoptComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private adoptService = inject(AdoptService);

  adoptionAds = signal<AdoptionAd[]>([]);
  isLoading = signal(true);
  hasError = signal(false);


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
      }
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
      case 'available': return 'Disponibile';
      case 'pending': return 'In attesa';
      case 'adopted': return 'Adottato';
      default: return status;
    }
  }

  contactOwner(ad: AdoptionAd): void {
    // Open chat - using ad ID as reference since ownerId not available
    this.router.navigate(['/home/chat'], {
      queryParams: {
        adId: ad.id,
        subject: `Interessato a ${ad.petName}`
      }
    });
  }

  viewDetails(ad: AdoptionAd): void {
    // Navigate to adoption ad detail page
    this.router.navigate(['/home/adopt', ad.id]);
  }
}
