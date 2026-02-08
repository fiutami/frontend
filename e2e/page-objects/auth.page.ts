import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Authentication Page Objects
 * Covers: Landing, Login, Registration, OAuth flows
 */
export class AuthPage extends BasePage {
  // Landing page locators
  get heroSection(): Locator {
    return this.page.locator('.home-start, .hero');
  }

  get loginLink(): Locator {
    return this.page.locator('a[href*="login"], [data-testid="login-link"]');
  }

  get signupLink(): Locator {
    return this.page.locator('a[href*="signup"], [data-testid="signup-link"]');
  }

  // Login form locators
  get loginForm(): Locator {
    return this.page.locator('form[class*="login"], form[data-testid="login-form"]');
  }

  get emailInput(): Locator {
    return this.page.locator('input[type="email"], input[formControlName="email"], #email');
  }

  get passwordInput(): Locator {
    return this.page.locator('input[type="password"], input[formControlName="password"], #password');
  }

  get loginButton(): Locator {
    return this.page.locator('button[type="submit"]:has-text("Accedi"), button:has-text("Login")');
  }

  get googleLoginButton(): Locator {
    return this.page.locator('button:has-text("Google"), [data-testid="google-login"]');
  }

  get forgotPasswordLink(): Locator {
    return this.page.locator('a:has-text("Password dimenticata"), a:has-text("Forgot")');
  }

  // Registration form locators
  get registrationForm(): Locator {
    return this.page.locator('form[class*="signup"], form[class*="register"], form[data-testid="register-form"]');
  }

  get firstNameInput(): Locator {
    return this.page.locator('input[formControlName="firstName"], #firstName');
  }

  get lastNameInput(): Locator {
    return this.page.locator('input[formControlName="lastName"], #lastName');
  }

  get confirmPasswordInput(): Locator {
    return this.page.locator('input[formControlName="confirmPassword"], #confirmPassword');
  }

  get registerButton(): Locator {
    return this.page.locator('button[type="submit"]:has-text("Registrati"), button:has-text("Register")');
  }

  get termsCheckbox(): Locator {
    return this.page.locator('input[type="checkbox"][formControlName="terms"], #terms');
  }

  // Error messages
  get formError(): Locator {
    return this.page.locator('.error-message, .form-error, [class*="error"]');
  }

  get emailError(): Locator {
    return this.page.locator('[class*="email"][class*="error"], #email + .error, #email ~ .error');
  }

  get passwordError(): Locator {
    return this.page.locator('[class*="password"][class*="error"], #password + .error, #password ~ .error');
  }

  // Navigation methods
  async goToLanding(): Promise<void> {
    await this.goto('/');
    await this.waitForDomContentLoaded();
  }

  async goToLogin(): Promise<void> {
    await this.goto('/login');
    await this.waitForDomContentLoaded();
  }

  async goToSignup(): Promise<void> {
    await this.goto('/signup');
    await this.waitForDomContentLoaded();
  }

  // Login actions
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithGoogle(): Promise<void> {
    await this.googleLoginButton.click();
    // Google OAuth will open a popup - handled by mock or real OAuth
  }

  async expectLoginSuccess(): Promise<void> {
    await this.waitForNavigation(/\/home|\/user/);
  }

  async expectLoginError(): Promise<void> {
    await expect(this.formError).toBeVisible();
  }

  // Registration actions
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);

    // Accept terms if present
    if (await this.termsCheckbox.isVisible()) {
      await this.termsCheckbox.check();
    }

    await this.registerButton.click();
  }

  async expectRegistrationSuccess(): Promise<void> {
    await this.waitForNavigation(/\/home|\/user|\/verify/);
  }

  // Validation checks
  async expectEmailValidationError(): Promise<void> {
    await expect(this.emailError).toBeVisible();
  }

  async expectPasswordValidationError(): Promise<void> {
    await expect(this.passwordError).toBeVisible();
  }

  async expectFormToBeValid(): Promise<void> {
    await expect(this.loginButton).toBeEnabled();
  }

  async expectFormToBeInvalid(): Promise<void> {
    await expect(this.loginButton).toBeDisabled();
  }

  // Landing page checks
  async expectLandingPage(): Promise<void> {
    await expect(this.heroSection).toBeVisible();
  }

  async expectLoginForm(): Promise<void> {
    await expect(this.loginForm.or(this.emailInput)).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectRegistrationForm(): Promise<void> {
    await expect(this.registrationForm.or(this.firstNameInput)).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getLocalStorage('fiutami_access_token');
    return token !== null && token.length > 0;
  }

  // Logout
  async logout(): Promise<void> {
    await this.clearLocalStorage();
    await this.goto('/');
  }
}
