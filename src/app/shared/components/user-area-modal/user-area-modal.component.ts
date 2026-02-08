import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { UserAreaModalService, UserAreaSection, UserAreaSubSection } from './user-area-modal.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { DrawerService } from '../drawer/drawer.service';

interface TabItem {
  id: UserAreaSection;
  labelKey: string;
  icon: string;
}

interface QuickAction {
  id: string;
  labelKey: string;
  icon: string;
  subSection?: UserAreaSubSection;
  route?: string;
  badge?: number;
}

@Component({
  selector: 'app-user-area-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './user-area-modal.component.html',
  styleUrls: ['./user-area-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideUp', [
      state('closed', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('open', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('closed => open', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
      transition('open => closed', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ]),
    trigger('fadeBackdrop', [
      state('closed', style({ opacity: 0, visibility: 'hidden' })),
      state('open', style({ opacity: 1, visibility: 'visible' })),
      transition('closed <=> open', animate('200ms ease-out')),
    ]),
  ],
})
export class UserAreaModalComponent implements OnInit, OnDestroy {
  private modalService = inject(UserAreaModalService);
  private authService = inject(AuthService);
  private drawerService = inject(DrawerService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // State from service
  isOpen = false;
  currentSection: UserAreaSection = 'account';
  currentSubSection: UserAreaSubSection | null = null;

  // User data
  user: User | null = null;

  // Tabs configuration
  tabs: TabItem[] = [
    { id: 'account', labelKey: 'userArea.tabs.account', icon: 'person' },
    { id: 'profile', labelKey: 'userArea.tabs.profile', icon: 'badge' },
    { id: 'security', labelKey: 'userArea.tabs.security', icon: 'shield' },
    { id: 'settings', labelKey: 'userArea.tabs.settings', icon: 'settings' },
  ];

  // Quick actions per section
  accountActions: QuickAction[] = [
    { id: 'notifications', labelKey: 'userArea.actions.notifications', icon: 'notifications', subSection: 'notifications', badge: 0 },
    { id: 'activity', labelKey: 'userArea.actions.activity', icon: 'history', subSection: 'activity' },
    { id: 'saved', labelKey: 'userArea.actions.saved', icon: 'bookmark', subSection: 'saved' },
    { id: 'subscription', labelKey: 'userArea.actions.subscription', icon: 'card_membership', subSection: 'subscription' },
  ];

  profileActions: QuickAction[] = [
    { id: 'editProfile', labelKey: 'userArea.actions.editProfile', icon: 'edit', route: '/user/profile' },
    { id: 'friends', labelKey: 'userArea.actions.friends', icon: 'group', subSection: 'friends' },
    { id: 'invite', labelKey: 'userArea.actions.invite', icon: 'share', subSection: 'invite' },
  ];

  securityActions: QuickAction[] = [
    { id: 'privacy', labelKey: 'userArea.actions.privacy', icon: 'security', subSection: 'privacy' },
    { id: 'blocked', labelKey: 'userArea.actions.blocked', icon: 'block', subSection: 'blocked' },
    { id: 'terms', labelKey: 'userArea.actions.terms', icon: 'description', subSection: 'terms' },
  ];

  settingsActions: QuickAction[] = [
    { id: 'language', labelKey: 'userArea.actions.language', icon: 'language' },
    { id: 'contact', labelKey: 'userArea.actions.contact', icon: 'mail', subSection: 'contact' },
    { id: 'premium', labelKey: 'userArea.actions.premium', icon: 'workspace_premium', route: '/premium' },
    { id: 'chat', labelKey: 'userArea.actions.chat', icon: 'chat', route: '/chat' },
  ];

  // Language settings
  showLanguageDropdown = false;
  currentLang = 'it';
  languages = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  constructor() {
    // Use effect to react to service state changes
    effect(() => {
      this.isOpen = this.modalService.isOpen();
      this.currentSection = this.modalService.section();
      this.currentSubSection = this.modalService.subSection();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Load current language
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
    }

    // Subscribe to user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.goBack();
    }
  }

  get animationState(): string {
    return this.isOpen ? 'open' : 'closed';
  }

  get currentActions(): QuickAction[] {
    switch (this.currentSection) {
      case 'account': return this.accountActions;
      case 'profile': return this.profileActions;
      case 'security': return this.securityActions;
      case 'settings': return this.settingsActions;
      default: return [];
    }
  }

  get currentLanguage() {
    return this.languages.find(l => l.code === this.currentLang) || this.languages[0];
  }

  close(): void {
    this.modalService.close();
    this.showLanguageDropdown = false;
  }

  goBack(): void {
    if (this.currentSubSection) {
      this.modalService.goBack();
    } else {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('user-area-backdrop')) {
      this.close();
    }
  }

  selectTab(tab: TabItem): void {
    this.modalService.navigateToSection(tab.id);
    this.showLanguageDropdown = false;
  }

  onActionClick(action: QuickAction): void {
    if (action.route) {
      this.router.navigate([action.route]);
      this.close();
    } else if (action.subSection) {
      this.modalService.navigateToSubSection(action.subSection);
    } else if (action.id === 'language') {
      this.showLanguageDropdown = !this.showLanguageDropdown;
    }
  }

  onLanguageChange(langCode: string): void {
    this.currentLang = langCode;
    this.translateService.use(langCode);
    localStorage.setItem('lang', langCode);
    this.showLanguageDropdown = false;
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/user/profile']);
    this.close();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.close();
    // Also close drawer if open
    this.drawerService.close();
  }

  getUserDisplayName(): string {
    if (!this.user) return '';
    if (this.user.firstName && this.user.lastName) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    return this.user.firstName || this.user.email?.split('@')[0] || '';
  }

  getUserInitials(): string {
    if (!this.user) return '?';
    const first = this.user.firstName?.charAt(0) || '';
    const last = this.user.lastName?.charAt(0) || '';
    return (first + last) || this.user.email?.charAt(0)?.toUpperCase() || '?';
  }

  getSubSectionTitle(): string {
    if (!this.currentSubSection) return '';
    const titles: Record<UserAreaSubSection, string> = {
      notifications: 'userArea.subSections.notifications',
      activity: 'userArea.subSections.activity',
      saved: 'userArea.subSections.saved',
      friends: 'userArea.subSections.friends',
      blocked: 'userArea.subSections.blocked',
      invite: 'userArea.subSections.invite',
      subscription: 'userArea.subSections.subscription',
      privacy: 'userArea.subSections.privacy',
      terms: 'userArea.subSections.terms',
      contact: 'userArea.subSections.contact',
    };
    return titles[this.currentSubSection] || '';
  }
}
