import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, TwoFactorSetupResponse } from '../../core/services/auth.service';

/**
 * Setup2FAComponent - Two-Factor Authentication setup
 *
 * Features:
 * - QR code display for authenticator app setup
 * - Manual secret key display
 * - TOTP code verification
 * - Backup codes display and download
 */
@Component({
  selector: 'app-setup-2fa',
  templateUrl: './setup-2fa.component.html',
  styleUrls: ['./setup-2fa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Setup2FAComponent implements OnInit {
  isLoading = true;
  isVerifying = false;
  errorMessage = '';

  // Setup data
  qrCodeUrl = '';
  secret = '';
  backupCodes: string[] = [];

  // Verification
  verificationCode = '';
  setupComplete = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load2FASetup();
  }

  load2FASetup(): void {
    this.isLoading = true;
    this.authService.setup2FA().subscribe({
      next: (response: TwoFactorSetupResponse) => {
        this.qrCodeUrl = response.qrCodeUrl;
        this.secret = response.secret;
        this.backupCodes = response.backupCodes;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Errore nel caricamento del setup 2FA';
        this.cdr.markForCheck();
      }
    });
  }

  onVerify(): void {
    if (this.verificationCode.length === 6 && !this.isVerifying) {
      this.isVerifying = true;
      this.errorMessage = '';

      this.authService.enable2FA(this.verificationCode).subscribe({
        next: (response) => {
          this.backupCodes = response.backupCodes;
          this.setupComplete = true;
          this.isVerifying = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isVerifying = false;
          this.errorMessage = err.error?.message || 'Codice non valido';
          this.verificationCode = '';
          this.cdr.markForCheck();
        }
      });
    }
  }

  downloadBackupCodes(): void {
    const text = this.backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fiutami-backup-codes.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  copySecret(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.secret).then(() => {
        // Could show a toast notification here
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/user/settings']);
  }

  finish(): void {
    this.router.navigate(['/user/settings']);
  }
}
