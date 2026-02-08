import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AdoptionService } from '../services/adoption.service';
import { Adoption } from '../models/adoption.models';

@Component({
  selector: 'app-adoption-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './adoption-detail.component.html',
  styleUrls: ['./adoption-detail.component.scss']
})
export class AdoptionDetailComponent implements OnInit, OnDestroy {
  adoption: Adoption | null = null;
  loading = true;
  error = false;
  isOwner = false;

  private destroy$ = new Subject<void>();

  constructor(
    private adoptionService: AdoptionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAdoption(id);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdoption(id: string) {
    this.loading = true;
    this.error = false;

    this.adoptionService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (adoption) => {
          this.adoption = adoption;
          this.loading = false;
          // TODO: check if current user is owner
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/adoption']);
  }

  contactOwner() {
    if (this.adoption?.allowMessages) {
      // Navigate to chat with owner
      this.router.navigate(['/chat'], {
        queryParams: { userId: this.adoption.ownerUserId }
      });
    }
  }

  editAdoption() {
    if (this.adoption) {
      this.router.navigate(['/adoption/create'], {
        queryParams: { edit: this.adoption.id }
      });
    }
  }

  markAsAdopted() {
    if (this.adoption) {
      this.adoptionService.markAdopted(this.adoption.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.adoption) {
              this.adoption.status = 'adopted';
            }
          }
        });
    }
  }

  cancelAdoption() {
    if (this.adoption) {
      this.adoptionService.cancel(this.adoption.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/adoption']);
          }
        });
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'adoption.status.available';
      case 'pending': return 'adoption.status.pending';
      case 'adopted': return 'adoption.status.adopted';
      case 'cancelled': return 'adoption.status.cancelled';
      default: return status;
    }
  }
}
