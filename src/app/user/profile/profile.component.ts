import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User, ProfileData } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profile: ProfileData | null = null;
  profileForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(500)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      city: ['', [Validators.maxLength(100)]],
      country: ['', [Validators.maxLength(100)]],
      email: [{ value: this.user?.email || '', disabled: true }]
    });
  }

  private loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          phoneNumber: profile.phoneNumber || '',
          city: profile.city || '',
          country: profile.country || ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get userInitials(): string {
    if (!this.user) return '?';
    const first = this.user.firstName?.[0] || '';
    const last = this.user.lastName?.[0] || '';
    return (first + last).toUpperCase() || this.user.email[0].toUpperCase();
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isSaving) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updates: Partial<ProfileData> = {
      displayName: this.profileForm.get('displayName')?.value?.trim() || '',
      bio: this.profileForm.get('bio')?.value?.trim() || '',
      phoneNumber: this.profileForm.get('phoneNumber')?.value?.trim() || '',
      city: this.profileForm.get('city')?.value?.trim() || '',
      country: this.profileForm.get('country')?.value?.trim() || ''
    };

    this.authService.updateProfile(updates).subscribe({
      next: (profile) => {
        this.isSaving = false;
        this.profile = profile;
        this.successMessage = 'Profilo aggiornato con successo!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Errore durante l\'aggiornamento del profilo.';
      }
    });
  }
}
