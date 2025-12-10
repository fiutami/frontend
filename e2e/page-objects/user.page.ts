import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * User Area Page Objects
 * Covers: Dashboard, Profile, Settings, Security, Account
 */
export class UserPage extends BasePage {
  // Layout locators
  get sidebar(): Locator {
    return this.page.locator('.user-layout__sidebar');
  }

  get sidebarToggle(): Locator {
    return this.page.locator('.user-layout__menu-btn');
  }

  get sidebarOverlay(): Locator {
    return this.page.locator('.user-layout__overlay');
  }

  get userAvatar(): Locator {
    return this.page.locator('.user-layout__avatar');
  }

  get userName(): Locator {
    return this.page.locator('.user-layout__user-name');
  }

  get userEmail(): Locator {
    return this.page.locator('.user-layout__user-email');
  }

  get logoutButton(): Locator {
    return this.page.locator('.user-layout__logout-btn');
  }

  get desktopLogoutButton(): Locator {
    return this.page.locator('.user-layout__logout-btn--desktop');
  }

  // Navigation links
  get dashboardLink(): Locator {
    return this.page.locator('.user-nav__item[href*="dashboard"]');
  }

  get profileLink(): Locator {
    return this.page.locator('.user-nav__item[href*="profile"]');
  }

  get settingsLink(): Locator {
    return this.page.locator('.user-nav__item[href*="settings"]');
  }

  get securityLink(): Locator {
    return this.page.locator('.user-nav__item[href*="security"]');
  }

  get accountLink(): Locator {
    return this.page.locator('.user-nav__item[href*="account"]');
  }

  // Dashboard locators
  get dashboardTitle(): Locator {
    return this.page.locator('.dashboard__title');
  }

  get statsCards(): Locator {
    return this.page.locator('.stat-card');
  }

  get quickActions(): Locator {
    return this.page.locator('.quick-action');
  }

  get recentSessions(): Locator {
    return this.page.locator('.session-item');
  }

  // Profile locators
  get profileForm(): Locator {
    return this.page.locator('.profile__form');
  }

  get displayNameInput(): Locator {
    return this.page.locator('#displayName');
  }

  get bioInput(): Locator {
    return this.page.locator('#bio');
  }

  get cityInput(): Locator {
    return this.page.locator('#city');
  }

  get countryInput(): Locator {
    return this.page.locator('#country');
  }

  get phoneInput(): Locator {
    return this.page.locator('#phoneNumber');
  }

  get saveProfileButton(): Locator {
    return this.page.locator('.profile__form button[type="submit"]');
  }

  get googleBadge(): Locator {
    return this.page.locator('.profile__auth-badge');
  }

  // Settings locators
  get settingsForm(): Locator {
    return this.page.locator('form:has(.settings__section)');
  }

  get emailNotificationsToggle(): Locator {
    return this.page.locator('[formControlName="emailNotifications"]');
  }

  get pushNotificationsToggle(): Locator {
    return this.page.locator('[formControlName="pushNotifications"]');
  }

  get marketingEmailsToggle(): Locator {
    return this.page.locator('[formControlName="marketingEmails"]');
  }

  get profilePublicToggle(): Locator {
    return this.page.locator('[formControlName="profilePublic"]');
  }

  get languageSelect(): Locator {
    return this.page.locator('[formControlName="language"]');
  }

  get themeSelect(): Locator {
    return this.page.locator('[formControlName="theme"]');
  }

  get saveSettingsButton(): Locator {
    return this.page.locator('.settings__actions button[type="submit"]');
  }

  // Security locators
  get changePasswordButton(): Locator {
    return this.page.locator('button:has-text("Modifica Password")');
  }

  get passwordForm(): Locator {
    return this.page.locator('.security__form');
  }

  get currentPasswordInput(): Locator {
    return this.page.locator('#currentPassword');
  }

  get newPasswordInput(): Locator {
    return this.page.locator('#newPassword');
  }

  get confirmPasswordInput(): Locator {
    return this.page.locator('#confirmPassword');
  }

  get submitPasswordButton(): Locator {
    return this.page.locator('.security__form button[type="submit"]');
  }

  get sessionCards(): Locator {
    return this.page.locator('.session-card');
  }

  get currentSessionBadge(): Locator {
    return this.page.locator('.session-card__badge');
  }

  get revokeSessionButton(): Locator {
    return this.page.locator('.session-card__revoke');
  }

  get revokeAllSessionsButton(): Locator {
    return this.page.locator('button:has-text("Disconnetti altre")');
  }

  get googleAccountInfo(): Locator {
    return this.page.locator('.security__info');
  }

  // Account locators
  get accountOverview(): Locator {
    return this.page.locator('.account__info-grid');
  }

  get exportDataButton(): Locator {
    return this.page.locator('button:has-text("Esporta i miei dati")');
  }

  get deleteAccountButton(): Locator {
    return this.page.locator('.account__danger-box button');
  }

  get deleteConfirmModal(): Locator {
    return this.page.locator('.modal:has-text("Conferma Eliminazione")');
  }

  get deleteConfirmInput(): Locator {
    return this.page.locator('.modal__confirm-input input');
  }

  get confirmDeleteButton(): Locator {
    return this.page.locator('.modal button:has-text("Elimina il mio account")');
  }

  get cancelDeleteButton(): Locator {
    return this.page.locator('.modal button:has-text("Annulla")');
  }

  get exportModal(): Locator {
    return this.page.locator('.modal:has-text("Esporta Dati")');
  }

  // Navigation methods
  async goToDashboard(): Promise<void> {
    await this.goto('/user/dashboard');
    await this.waitForLoadingToFinish();
  }

  async goToProfile(): Promise<void> {
    await this.goto('/user/profile');
    await this.waitForLoadingToFinish();
  }

  async goToSettings(): Promise<void> {
    await this.goto('/user/settings');
    await this.waitForLoadingToFinish();
  }

  async goToSecurity(): Promise<void> {
    await this.goto('/user/security');
    await this.waitForLoadingToFinish();
  }

  async goToAccount(): Promise<void> {
    await this.goto('/user/account');
    await this.waitForLoadingToFinish();
  }

  // Sidebar actions
  async openMobileSidebar(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.sidebarToggle.click();
      await expect(this.sidebar).toHaveClass(/--open/);
    }
  }

  async closeMobileSidebar(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.sidebarOverlay.click();
      await expect(this.sidebar).not.toHaveClass(/--open/);
    }
  }

  async navigateToSection(section: 'dashboard' | 'profile' | 'settings' | 'security' | 'account'): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.openMobileSidebar();
    }

    const linkMap = {
      dashboard: this.dashboardLink,
      profile: this.profileLink,
      settings: this.settingsLink,
      security: this.securityLink,
      account: this.accountLink,
    };

    await linkMap[section].click();
    await this.waitForLoadingToFinish();
  }

  // Profile actions
  async updateProfile(data: Partial<{
    displayName: string;
    bio: string;
    city: string;
    country: string;
    phone: string;
  }>): Promise<void> {
    if (data.displayName) await this.displayNameInput.fill(data.displayName);
    if (data.bio) await this.bioInput.fill(data.bio);
    if (data.city) await this.cityInput.fill(data.city);
    if (data.country) await this.countryInput.fill(data.country);
    if (data.phone) await this.phoneInput.fill(data.phone);

    await this.saveProfileButton.click();
  }

  // Settings actions
  async toggleSetting(setting: 'emailNotifications' | 'pushNotifications' | 'marketingEmails' | 'profilePublic'): Promise<void> {
    const toggleMap = {
      emailNotifications: this.emailNotificationsToggle,
      pushNotifications: this.pushNotificationsToggle,
      marketingEmails: this.marketingEmailsToggle,
      profilePublic: this.profilePublicToggle,
    };
    await toggleMap[setting].click();
  }

  async saveSettings(): Promise<void> {
    await this.saveSettingsButton.click();
  }

  async selectLanguage(lang: string): Promise<void> {
    await this.languageSelect.selectOption(lang);
  }

  async selectTheme(theme: string): Promise<void> {
    await this.themeSelect.selectOption(theme);
  }

  // Security actions
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.changePasswordButton.click();
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.submitPasswordButton.click();
  }

  async revokeSession(index: number = 0): Promise<void> {
    const buttons = await this.revokeSessionButton.all();
    if (buttons[index]) {
      await buttons[index].click();
    }
  }

  async revokeAllOtherSessions(): Promise<void> {
    await this.revokeAllSessionsButton.click();
  }

  // Account actions
  async requestAccountDeletion(): Promise<void> {
    await this.deleteAccountButton.click();
    await expect(this.deleteConfirmModal).toBeVisible();
    await this.deleteConfirmInput.fill('elimina');
    await this.confirmDeleteButton.click();
  }

  async cancelAccountDeletion(): Promise<void> {
    await this.cancelDeleteButton.click();
    await expect(this.deleteConfirmModal).not.toBeVisible();
  }

  async exportAccountData(): Promise<void> {
    await this.exportDataButton.click();
    await expect(this.exportModal).toBeVisible();
    await this.page.locator('.modal button:has-text("Esporta Dati")').click();
  }

  // Logout
  async logout(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.openMobileSidebar();
      await this.logoutButton.click();
    } else {
      await this.desktopLogoutButton.click();
    }
    await this.waitForNavigation(/^\/$|\/login|\/auth/);
  }

  // Assertions
  async expectDashboard(): Promise<void> {
    await expect(this.dashboardTitle).toBeVisible();
    await expect(this.statsCards.first()).toBeVisible();
  }

  async expectProfile(): Promise<void> {
    await expect(this.profileForm).toBeVisible();
  }

  async expectSettings(): Promise<void> {
    await expect(this.settingsForm).toBeVisible();
  }

  async expectSecurity(): Promise<void> {
    await expect(this.sessionCards.first().or(this.googleAccountInfo)).toBeVisible();
  }

  async expectAccount(): Promise<void> {
    await expect(this.accountOverview).toBeVisible();
    await expect(this.deleteAccountButton).toBeVisible();
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  async expectErrorMessage(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
