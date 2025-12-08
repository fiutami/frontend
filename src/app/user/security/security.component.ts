import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';
import { SessionService, UserSession } from '../../core/services/session.service';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  user: User | null = null;
  sessions: UserSession[] = [];
  passwordForm!: FormGroup;

  isLoadingSessions = true;
  isChangingPassword = false;
  isRevokingSession = false;

  passwordSuccessMessage = '';
  passwordErrorMessage = '';
  sessionErrorMessage = '';

  showPasswordForm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initPasswordForm();
    this.loadSessions();
  }

  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadSessions(): void {
    this.sessionService.loadSessions().subscribe({
      next: (response) => {
        this.sessions = response.sessions;
        this.isLoadingSessions = false;
      },
      error: () => {
        this.sessionErrorMessage = 'Impossibile caricare le sessioni attive.';
        this.isLoadingSessions = false;
      }
    });
  }

  get hasPassword(): boolean {
    return this.user?.provider !== 'google';
  }

  get canSetPassword(): boolean {
    return this.user?.provider === 'google';
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
      this.passwordSuccessMessage = '';
      this.passwordErrorMessage = '';
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword) return;

    this.isChangingPassword = true;
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.accountService.changePassword({
      currentPassword,
      newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccessMessage = 'Password modificata con successo!';
        this.passwordForm.reset();
        this.showPasswordForm = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isChangingPassword = false;
        this.passwordErrorMessage = err.error?.message || 'Errore durante la modifica della password.';
      }
    });
  }

  revokeSession(sessionId: string): void {
    if (this.isRevokingSession) return;

    this.isRevokingSession = true;
    this.sessionErrorMessage = '';

    this.sessionService.revokeSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.isRevokingSession = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isRevokingSession = false;
        this.sessionErrorMessage = err.error?.message || 'Impossibile revocare la sessione.';
      }
    });
  }

  revokeAllOtherSessions(): void {
    if (this.isRevokingSession) return;

    this.isRevokingSession = true;
    this.sessionErrorMessage = '';

    this.sessionService.revokeAllSessions(true).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.isCurrent);
        this.isRevokingSession = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isRevokingSession = false;
        this.sessionErrorMessage = err.error?.message || 'Impossibile revocare le sessioni.';
      }
    });
  }

  getDeviceIcon(deviceInfo: string): string {
    const info = deviceInfo.toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
      return 'mobile';
    }
    if (info.includes('tablet') || info.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }
}
