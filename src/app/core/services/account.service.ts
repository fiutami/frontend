import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  passwordChangedAt: string | null;
}

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

export interface DeleteAccountRequest {
  password: string;
  deletionType: 'soft' | 'hard';
  reason?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  scheduledDeletionAt: string | null;
  deletionRequestId: string | null;
}

export interface AccountStatus {
  isDeleted: boolean;
  isEmailVerified: boolean;
  hasPassword: boolean;
  hasPendingEmailChange: boolean;
  pendingEmail: string | null;
  hasPendingDeletion: boolean;
  scheduledDeletionAt: string | null;
  lastPasswordChangeAt: string | null;
  activeSessionsCount: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  data?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private accountStatusSignal = signal<AccountStatus | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly accountStatus = this.accountStatusSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadAccountStatus(): Observable<AccountStatus> {
    this.loadingSignal.set(true);
    return this.http.get<AccountStatus>(`${environment.apiUrl}/account/status`).pipe(
      tap(status => {
        this.accountStatusSignal.set(status);
        this.loadingSignal.set(false);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(
      `${environment.apiUrl}/account/change-password`,
      request
    );
  }

  changeEmail(request: ChangeEmailRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${environment.apiUrl}/account/change-email`,
      request
    );
  }

  verifyEmail(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${environment.apiUrl}/account/verify-email`,
      { token }
    );
  }

  deleteAccount(request: DeleteAccountRequest): Observable<DeleteAccountResponse> {
    return this.http.post<DeleteAccountResponse>(
      `${environment.apiUrl}/account/delete`,
      request
    );
  }

  cancelDeletion(password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${environment.apiUrl}/account/cancel-deletion`,
      { password }
    );
  }
}
