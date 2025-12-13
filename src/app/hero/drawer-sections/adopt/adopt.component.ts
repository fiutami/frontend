import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AdoptService, AdoptionAd, PetType } from '../../../core/services/adopt.service';
import { BottomTabBarComponent } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.component';
import { TabItem } from '../../../shared/components/bottom-tab-bar/bottom-tab-bar.models';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule, BottomTabBarComponent],
  templateUrl: './adopt.component.html',
  styleUrls: ['./adopt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdoptComponent implements OnInit {
  private location = inject(Location);
  private adoptService = inject(AdoptService);

  adoptionAds = signal<AdoptionAd[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  tabs: TabItem[] = [
    { id: 'home', icon: 'home', label: 'Home', route: '/home' },
    { id: 'explore', icon: 'explore', label: 'Esplora', route: '/explore' },
    { id: 'add', icon: 'add_circle', label: 'Aggiungi', route: '/add' },
    { id: 'messages', icon: 'chat', label: 'Messaggi', route: '/messages' },
    { id: 'profile', icon: 'person', label: 'Profilo', route: '/profile' }
  ];

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
    console.log('Contact owner for:', ad.petName);
  }

  viewDetails(ad: AdoptionAd): void {
    console.log('View details for:', ad.petName);
  }
}
