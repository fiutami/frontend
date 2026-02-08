import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

interface NotificationSetting {
  key: string;
  label: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  isLoading = false;
  successMessage = '';

  notificationSettings: NotificationSetting[] = [
    { key: 'general', label: 'Notifiche generali', enabled: true },
    { key: 'sound', label: 'Suono', enabled: true },
    { key: 'dnd', label: 'Modalità non disturbare', enabled: true },
    { key: 'vibration', label: 'Vibrazione', enabled: false },
    { key: 'lockScreen', label: 'Schermata di blocco', enabled: false },
    { key: 'reminders', label: 'Promemoria', enabled: true }
  ];

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    // TODO: Load from API/storage
  }

  goBack(): void {
    this.location.back();
  }

  toggleSetting(setting: NotificationSetting): void {
    setting.enabled = !setting.enabled;
    this.saveSettings();
  }

  private async saveSettings(): Promise<void> {
    // TODO: Save to API/storage
    console.log('Settings updated:', this.notificationSettings);
  }

  async updateProfile(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.successMessage = '';

    try {
      // TODO: Call API to update notification settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.successMessage = 'Impostazioni aggiornate!';
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
