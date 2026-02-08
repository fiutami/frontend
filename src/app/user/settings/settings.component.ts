import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService, UserSettings } from '../../core/services/settings.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      // Notifications
      emailNotifications: [true],
      pushNotifications: [false],
      marketingEmails: [false],
      weeklyDigest: [false],

      // Privacy
      profilePublic: [false],
      showEmail: [false],
      showPhone: [false],
      allowSearchByEmail: [false],

      // Preferences
      language: ['it'],
      timezone: ['Europe/Rome'],
      theme: ['light']
    });
  }

  private loadSettings(): void {
    this.settingsService.loadSettings().subscribe({
      next: (settings: UserSettings) => {
        this.settingsForm.patchValue({
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          marketingEmails: settings.marketingEmails,
          weeklyDigest: settings.weeklyDigest,
          profilePublic: settings.profilePublic,
          showEmail: settings.showEmail,
          showPhone: settings.showPhone,
          allowSearchByEmail: settings.allowSearchByEmail,
          language: settings.language,
          timezone: settings.timezone,
          theme: settings.theme
        });
        this.isLoading = false;
      },
      error: () => {
        // Use defaults if settings not found
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.isSaving) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.settingsForm.value;

    // Update all three settings sections
    forkJoin({
      notifications: this.settingsService.updateNotifications({
        emailNotifications: formValue.emailNotifications,
        pushNotifications: formValue.pushNotifications,
        marketingEmails: formValue.marketingEmails,
        weeklyDigest: formValue.weeklyDigest
      }),
      privacy: this.settingsService.updatePrivacy({
        profilePublic: formValue.profilePublic,
        showEmail: formValue.showEmail,
        showPhone: formValue.showPhone,
        allowSearchByEmail: formValue.allowSearchByEmail
      }),
      preferences: this.settingsService.updatePreferences({
        language: formValue.language,
        timezone: formValue.timezone,
        theme: formValue.theme
      })
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Impostazioni salvate con successo!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Errore durante il salvataggio delle impostazioni.';
      }
    });
  }
}
