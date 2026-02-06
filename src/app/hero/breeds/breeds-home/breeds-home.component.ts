import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { BreedsService } from '../breeds.service';
import { Species } from '../models/breed.model';
import { TabPageShellDefaultComponent } from '../../../shared/components/tab-page-shell-default/tab-page-shell-default.component';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-breeds-home',
  standalone: true,
  imports: [CommonModule, TabPageShellDefaultComponent, SharedModule],
  templateUrl: './breeds-home.component.html',
  styleUrls: ['./breeds-home.component.scss']
})
export class BreedsHomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly breedsService = inject(BreedsService);

  // State
  readonly speciesList = this.breedsService.speciesList;
  readonly isLoading = this.breedsService.isLoading;
  readonly selectedSpecies = this.breedsService.selectedSpecies;

  // Carousel state
  readonly carouselIndex = signal(0);
  readonly isAnimating = signal(false);

  ngOnInit(): void {
    this.breedsService.loadSpecies().subscribe();
  }

  selectSpecies(species: Species): void {
    this.breedsService.selectSpecies(species);
    // Navigate to finder or show breeds list
    this.router.navigate(['/home/breeds/finder'], {
      queryParams: { species: species.id }
    });
  }

  goToFinder(): void {
    this.router.navigate(['/home/breeds/finder']);
  }

  goBack(): void {
    this.location.back();
  }

  // Carousel navigation
  nextSlide(): void {
    if (this.isAnimating()) return;
    const total = this.speciesList().length;
    if (total === 0) return;

    this.isAnimating.set(true);
    this.carouselIndex.update(i => (i + 1) % total);
    setTimeout(() => this.isAnimating.set(false), 300);
  }

  prevSlide(): void {
    if (this.isAnimating()) return;
    const total = this.speciesList().length;
    if (total === 0) return;

    this.isAnimating.set(true);
    this.carouselIndex.update(i => (i - 1 + total) % total);
    setTimeout(() => this.isAnimating.set(false), 300);
  }

  // Get visible species for carousel (show 3 at a time on mobile)
  getVisibleSpecies(): Species[] {
    const list = this.speciesList();
    if (list.length <= 3) return list;

    const index = this.carouselIndex();
    const result: Species[] = [];
    for (let i = 0; i < 4; i++) {
      result.push(list[(index + i) % list.length]);
    }
    return result;
  }

  trackBySpecies(index: number, species: Species): string {
    return species.id;
  }
}
