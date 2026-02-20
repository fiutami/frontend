import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Shell Drawer (sfondo blu solido, solo header + back, niente avatar/logo/mascot/tab bar)
import { TabPageShellDrawerComponent } from '../../../shared/components/tab-page-shell-drawer';

export interface NotificationSetting {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabPageShellDrawerComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly location = inject(Location);
  private readonly translate = inject(TranslateService);

  /** Translated page title */
  protected pageTitle = this.translate.instant('notifications.settingsTitle');

  /** Notification settings toggles */
  protected settings = signal<NotificationSetting[]>([
    {
      id: 'general',
      icon: 'notifications_active',
      titleKey: 'notifications.settings.general.title',
      descriptionKey: 'notifications.settings.general.description',
      enabled: true,
    },
    {
      id: 'sound',
      icon: 'volume_up',
      titleKey: 'notifications.settings.sound.title',
      descriptionKey: 'notifications.settings.sound.description',
      enabled: true,
    },
    {
      id: 'vibration',
      icon: 'vibration',
      titleKey: 'notifications.settings.vibration.title',
      descriptionKey: 'notifications.settings.vibration.description',
      enabled: false,
    },
    {
      id: 'dnd',
      icon: 'do_not_disturb_on',
      titleKey: 'notifications.settings.dnd.title',
      descriptionKey: 'notifications.settings.dnd.description',
      enabled: false,
    },
    {
      id: 'lockScreen',
      icon: 'lock',
      titleKey: 'notifications.settings.lockScreen.title',
      descriptionKey: 'notifications.settings.lockScreen.description',
      enabled: true,
    },
    {
      id: 'reminders',
      icon: 'alarm',
      titleKey: 'notifications.settings.reminders.title',
      descriptionKey: 'notifications.settings.reminders.description',
      enabled: true,
    },
  ]);

  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pageTitle = this.translate.instant('notifications.settingsTitle');
    });
  }

  goBack(): void {
    this.location.back();
  }

  toggleSetting(settingId: string): void {
    this.settings.update(list =>
      list.map(s =>
        s.id === settingId ? { ...s, enabled: !s.enabled } : s
      )
    );
  }
}
