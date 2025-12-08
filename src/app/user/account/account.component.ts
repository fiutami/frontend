import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user: User | null = null;

  showDeleteConfirm = false;
  deleteConfirmText = '';
  isDeleting = false;
  deleteError = '';

  showExportModal = false;
  isExporting = false;
  exportSuccess = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  get canDelete(): boolean {
    return this.deleteConfirmText.toLowerCase() === 'elimina';
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
    this.deleteConfirmText = '';
    this.deleteError = '';
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.deleteConfirmText = '';
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.canDelete || this.isDeleting) return;

    this.isDeleting = true;
    this.deleteError = '';

    // Use soft deletion with 30-day grace period
    this.accountService.deleteAccount({
      password: '', // Not required for OAuth users
      deletionType: 'soft',
      reason: 'Richiesta utente'
    }).subscribe({
      next: () => {
        this.isDeleting = false;
        this.authService.logout();
        this.router.navigate(['/'], {
          queryParams: { deleted: 'pending' }
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isDeleting = false;
        this.deleteError = err.error?.message || 'Errore durante la richiesta di eliminazione.';
      }
    });
  }

  openExportModal(): void {
    this.showExportModal = true;
    this.exportSuccess = false;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  exportData(): void {
    if (this.isExporting) return;

    this.isExporting = true;

    // GDPR data export endpoint
    this.http.get(`${environment.apiUrl}/account/export`, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.isExporting = false;
        this.exportSuccess = true;

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fiutami-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.isExporting = false;
        // Still close modal on error
      }
    });
  }
}
