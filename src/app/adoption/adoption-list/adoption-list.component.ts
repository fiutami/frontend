import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AdoptionService } from '../services/adoption.service';
import { Adoption, AdoptionSearchParams } from '../models/adoption.models';
import { TabPageShellDefaultComponent } from '../../shared/components/tab-page-shell-default/tab-page-shell-default.component';

@Component({
  selector: 'app-adoption-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, TabPageShellDefaultComponent],
  templateUrl: './adoption-list.component.html',
  styleUrls: ['./adoption-list.component.scss']
})
export class AdoptionListComponent implements OnInit, OnDestroy {
  adoptions: Adoption[] = [];
  loading = true;
  error = false;

  // Filtri
  selectedSpecies = '';
  selectedCity = '';

  speciesOptions = ['Cane', 'Gatto', 'Coniglio', 'Uccello', 'Altro'];

  private destroy$ = new Subject<void>();

  constructor(
    private adoptionService: AdoptionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAdoptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdoptions() {
    this.loading = true;
    this.error = false;

    const params: AdoptionSearchParams = {
      species: this.selectedSpecies || undefined,
      city: this.selectedCity || undefined,
      pageSize: 50
    };

    this.adoptionService.search(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.adoptions = response.items;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  onFilterChange() {
    this.loadAdoptions();
  }

  openDetail(adoption: Adoption) {
    this.router.navigate(['/adoption', adoption.id]);
  }

  createAdoption() {
    this.router.navigate(['/adoption/create']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
