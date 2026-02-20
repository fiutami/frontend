import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService, User } from '../../../core/services/auth.service';
import { AccountService } from '../../../core/services/account.service';
import { environment } from '../../../../environments/environment';

// Shell Blue (sfondo blu solido, include: Avatar, Logo, MascotPeek, BottomTabBar)
import { TabPageShellBlueComponent } from '../../../shared/components/tab-page-shell-blue/tab-page-shell-blue.component';

@Component({
  selector: 'app-account-drawer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    TabPageShellBlueComponent,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'account-page' }
})
export class AccountDrawerComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('drawerAccount.title');

  // State signals
  user = signal<User | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  // Modal states
  showDeleteConfirm = signal(false);
  deleteConfirmText = signal('');
  isDeleting = signal(false);
  deleteError = signal('');

  showExportModal = signal(false);
  isExporting = signal(false);
  exportSuccess = signal(false);

  exportRateLimit = signal(false);
  exportStatus = signal<string | null>(null);

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('drawerAccount.title');
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  goBack(): void {
    this.location.back();
  }

  loadUserData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const currentUser = this.authService.getCurrentUser();
      this.user.set(currentUser);
      this.isLoading.set(false);
    } catch {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  retry(): void {
    this.loadUserData();
  }

  getAccountType(): string {
    const provider = this.user()?.provider;
    return provider === 'google' ? 'Google' : 'Email';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  get canDelete(): boolean {
    return this.deleteConfirmText().toLowerCase() === 'elimina';
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm.set(true);
    this.deleteConfirmText.set('');
    this.deleteError.set('');
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.deleteConfirmText.set('');
    this.deleteError.set('');
  }

  updateDeleteConfirmText(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.deleteConfirmText.set(input.value);
  }

  confirmDelete(): void {
    if (!this.canDelete || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.deleteError.set('');

    this.accountService.deleteAccount({
      password: '',
      deletionType: 'soft',
      reason: 'Richiesta utente'
    }).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.authService.logout();
        this.router.navigate(['/'], {
          queryParams: { deleted: 'pending' }
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isDeleting.set(false);
        this.deleteError.set(
          err.error?.message || this.translate.instant('drawerAccount.deleteErrorGeneric')
        );
      }
    });
  }

  openExportModal(): void {
    this.showExportModal.set(true);
    this.exportSuccess.set(false);
  }

  closeExportModal(): void {
    this.showExportModal.set(false);
  }

  exportData(): void {
    if (this.isExporting()) return;

    this.isExporting.set(true);
    this.exportRateLimit.set(false);

    this.http.post<{ status: string }>(`${environment.apiUrl}/account/export`, {}).subscribe({
      next: (res) => {
        this.exportStatus.set(res.status);
        this.isExporting.set(false);
        this.exportSuccess.set(true);
        // Start polling for completion
        this.pollExportStatus();
      },
      error: (err) => {
        this.isExporting.set(false);
        if (err.status === 429) {
          this.exportRateLimit.set(true);
        }
      }
    });
  }

  private pollExportStatus(): void {
    const interval = setInterval(() => {
      this.http.get<{ status: string; downloadUrl?: string }>(`${environment.apiUrl}/account/export/status`).subscribe({
        next: (res) => {
          this.exportStatus.set(res.status);
          if (res.status === 'completed' && res.downloadUrl) {
            clearInterval(interval);
            window.open(res.downloadUrl, '_blank');
          } else if (res.status === 'failed') {
            clearInterval(interval);
          }
        },
        error: () => clearInterval(interval)
      });
    }, 5000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  }
}
