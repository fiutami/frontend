import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { SignupComponent } from './signup.component';
import { AuthService, AuthResponse } from '../../core/services/auth.service';

const mockAuthResponse: AuthResponse = {
  userId: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
  hasCompletedOnboarding: false
};

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signup', 'isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule
      ],
      declarations: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(SignupComponent, {
      set: { template: '<form [formGroup]="signupForm"><input formControlName="email"><input formControlName="inviteCode"><input formControlName="password"><input formControlName="confirmPassword"></form>' }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize signup form with empty fields', () => {
      expect(component.signupForm).toBeDefined();
      expect(component.signupForm.get('email')?.value).toBe('');
      expect(component.signupForm.get('inviteCode')?.value).toBe('');
      expect(component.signupForm.get('password')?.value).toBe('');
      expect(component.signupForm.get('confirmPassword')?.value).toBe('');
    });

    it('should have all required form controls', () => {
      expect(component.signupForm.contains('email')).toBeTruthy();
      expect(component.signupForm.contains('inviteCode')).toBeTruthy();
      expect(component.signupForm.contains('password')).toBeTruthy();
      expect(component.signupForm.contains('confirmPassword')).toBeTruthy();
    });

    it('should initialize with error message as empty string', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize with submitting state as false', () => {
      expect(component.isSubmitting).toBeFalsy();
    });
  });

  describe('Form Validation - Required Fields', () => {
    it('should make email required', () => {
      const email = component.signupForm.get('email');
      email?.setValue('');
      expect(email?.hasError('required')).toBeTruthy();
    });

    it('should make inviteCode required', () => {
      const inviteCode = component.signupForm.get('inviteCode');
      inviteCode?.setValue('');
      expect(inviteCode?.hasError('required')).toBeTruthy();
    });

    it('should make password required', () => {
      const password = component.signupForm.get('password');
      password?.setValue('');
      expect(password?.hasError('required')).toBeTruthy();
    });

    it('should make confirmPassword required', () => {
      const confirmPassword = component.signupForm.get('confirmPassword');
      confirmPassword?.setValue('');
      expect(confirmPassword?.hasError('required')).toBeTruthy();
    });
  });

  describe('Email Validation', () => {
    it('should validate email format', () => {
      const email = component.signupForm.get('email');

      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBeTruthy();

      email?.setValue('valid@email.com');
      expect(email?.hasError('email')).toBeFalsy();
    });

    it('should accept valid email formats', () => {
      const email = component.signupForm.get('email');
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
        'user123@subdomain.example.com'
      ];

      validEmails.forEach(validEmail => {
        email?.setValue(validEmail);
        expect(email?.valid).toBeTruthy();
      });
    });

    it('should reject invalid email formats', () => {
      const email = component.signupForm.get('email');
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@'
      ];

      invalidEmails.forEach(invalidEmail => {
        email?.setValue(invalidEmail);
        expect(email?.hasError('email')).toBeTruthy();
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate password minimum length', () => {
      const password = component.signupForm.get('password');

      password?.setValue('123');
      expect(password?.hasError('minlength')).toBeTruthy();

      password?.setValue('12345678');
      expect(password?.hasError('minlength')).toBeFalsy();
    });

    it('should require password to be at least 8 characters', () => {
      const password = component.signupForm.get('password');

      password?.setValue('1234567');
      expect(password?.invalid).toBeTruthy();

      password?.setValue('password1');
      expect(password?.hasError('minlength')).toBeFalsy();
    });

    it('should validate password strength (letters and numbers)', () => {
      const password = component.signupForm.get('password');

      password?.setValue('onlyletters');
      expect(password?.hasError('passwordStrength')).toBeTruthy();

      password?.setValue('12345678');
      expect(password?.hasError('passwordStrength')).toBeTruthy();

      password?.setValue('password1');
      expect(password?.hasError('passwordStrength')).toBeFalsy();
    });
  });

  describe('Password Match Validation', () => {
    it('should validate passwords match', () => {
      component.signupForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });

      expect(component.signupForm.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should invalidate when passwords do not match', () => {
      component.signupForm.patchValue({
        password: 'password123',
        confirmPassword: 'different123'
      });

      expect(component.signupForm.hasError('passwordMismatch')).toBeTruthy();
    });

    it('should have custom validator for password matching', () => {
      const form = component.signupForm;

      form.patchValue({
        password: 'test12345',
        confirmPassword: 'test54321'
      });

      expect(form.errors?.['passwordMismatch']).toBeTruthy();
    });

    it('should clear mismatch error when passwords match', () => {
      component.signupForm.patchValue({
        password: 'password123',
        confirmPassword: 'different123'
      });

      expect(component.signupForm.hasError('passwordMismatch')).toBeTruthy();

      component.signupForm.patchValue({
        confirmPassword: 'password123'
      });

      expect(component.signupForm.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Form Validity', () => {
    it('should invalidate form when fields are empty', () => {
      expect(component.signupForm.valid).toBeFalsy();
    });

    it('should validate form when all fields are correct', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      });

      expect(component.signupForm.valid).toBeTruthy();
    });

    it('should invalidate form when password mismatch', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'different123'
      });

      expect(component.signupForm.valid).toBeFalsy();
    });
  });

  describe('Signup Submission', () => {
    it('should emit signupSubmit event on valid form submit', () => {
      const userData = {
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      };
      component.signupForm.patchValue(userData);
      authService.signup.and.returnValue(of(mockAuthResponse));
      spyOn(component.signupSubmit, 'emit');

      component.onSubmit();

      expect(component.signupSubmit.emit).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password
      });
    });

    it('should not emit event when form is invalid', () => {
      component.signupForm.patchValue({
        email: '',
        inviteCode: '',
        password: '',
        confirmPassword: ''
      });
      spyOn(component.signupSubmit, 'emit');

      component.onSubmit();

      expect(component.signupSubmit.emit).not.toHaveBeenCalled();
    });

    it('should not submit when passwords do not match', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'different123'
      });
      spyOn(component.signupSubmit, 'emit');

      component.onSubmit();

      expect(component.signupSubmit.emit).not.toHaveBeenCalled();
    });

    it('should set isSubmitting to true on valid submit', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(component.isSubmitting).toBeTruthy();
    });

    it('should not submit when already submitting', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      });
      component.isSubmitting = true;
      spyOn(component.signupSubmit, 'emit');

      component.onSubmit();

      expect(component.signupSubmit.emit).not.toHaveBeenCalled();
    });

    it('should call authService.signup with credentials', () => {
      const credentials = { email: 'john@example.com', password: 'password123' };
      component.signupForm.patchValue({
        ...credentials,
        inviteCode: 'ILOVEFIUTAMI',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(authService.signup).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
        firstName: '',
        lastName: '',
        inviteCode: 'ILOVEFIUTAMI'
      });
    });

    it('should include invite code in payload', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: ' ILOVEFIUTAMI ',
        password: 'password123',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(authService.signup).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        firstName: '',
        lastName: '',
        inviteCode: 'ILOVEFIUTAMI'
      });
    });

    it('should not submit when invite code is invalid', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'WRONGCODE',
        password: 'password123',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(of(mockAuthResponse));
      spyOn(component.signupSubmit, 'emit');

      component.onSubmit();

      expect(component.signupSubmit.emit).not.toHaveBeenCalled();
      expect(authService.signup).not.toHaveBeenCalled();
    });

    it('should navigate to /home on successful signup', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(of(mockAuthResponse));
      spyOn(router, 'navigate');

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should set error message on signup failure', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(throwError(() => ({
        error: { message: 'Email already registered' }
      })));

      component.onSubmit();

      expect(component.errorMessage).toBe('Email already registered');
      expect(component.isSubmitting).toBeFalsy();
    });

    it('should set default error message on signup failure without message', () => {
      component.signupForm.patchValue({
        email: 'john@example.com',
        inviteCode: 'ILOVEFIUTAMI',
        password: 'password123',
        confirmPassword: 'password123'
      });
      authService.signup.and.returnValue(throwError(() => ({})));

      component.onSubmit();

      expect(component.errorMessage).toBe('Registrazione fallita. Riprova.');
      expect(component.isSubmitting).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to / when goBack is called', () => {
      spyOn(router, 'navigate');

      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to / when onBackClick is called', () => {
      spyOn(router, 'navigate');

      component.onBackClick();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should emit backClick event when onBackClick is called', () => {
      spyOn(component.backClick, 'emit');
      spyOn(router, 'navigate');

      component.onBackClick();

      expect(component.backClick.emit).toHaveBeenCalled();
    });
  });

  describe('Social Login', () => {
    it('should emit socialLoginClick with google when called', () => {
      spyOn(component.socialLoginClick, 'emit');

      component.onSocialLoginClick('google');

      expect(component.socialLoginClick.emit).toHaveBeenCalledWith('google');
    });

    it('should emit socialLoginClick with facebook when called', () => {
      spyOn(component.socialLoginClick, 'emit');

      component.onSocialLoginClick('facebook');

      expect(component.socialLoginClick.emit).toHaveBeenCalledWith('facebook');
    });

    it('should emit socialLoginClick with apple when called', () => {
      spyOn(component.socialLoginClick, 'emit');

      component.onSocialLoginClick('apple');

      expect(component.socialLoginClick.emit).toHaveBeenCalledWith('apple');
    });
  });

  describe('Error Messages', () => {
    it('should return email required error message', () => {
      component.signupForm.get('email')?.setValue('');
      component.signupForm.get('email')?.markAsTouched();

      expect(component.getEmailError()).toBe('Email obbligatoria');
    });

    it('should return email format error message', () => {
      component.signupForm.get('email')?.setValue('invalid-email');
      component.signupForm.get('email')?.markAsTouched();

      expect(component.getEmailError()).toBe("Inserisci un'email valida");
    });

    it('should return password required error message', () => {
      component.signupForm.get('password')?.setValue('');
      component.signupForm.get('password')?.markAsTouched();

      expect(component.getPasswordError()).toBe('Password obbligatoria');
    });

    it('should return password minlength error message', () => {
      component.signupForm.get('password')?.setValue('123');
      component.signupForm.get('password')?.markAsTouched();

      expect(component.getPasswordError()).toBe('Password minimo 8 caratteri');
    });

    it('should return password strength error message', () => {
      component.signupForm.get('password')?.setValue('onlyletters');
      component.signupForm.get('password')?.markAsTouched();

      expect(component.getPasswordError()).toBe('Usa lettere e numeri');
    });

    it('should return confirm password required error message', () => {
      component.signupForm.get('confirmPassword')?.setValue('');
      component.signupForm.get('confirmPassword')?.markAsTouched();

      expect(component.getConfirmPasswordError()).toBe('Conferma password obbligatoria');
    });

    it('should return password mismatch error message', () => {
      component.signupForm.patchValue({
        password: 'password123',
        confirmPassword: 'different123'
      });
      component.signupForm.get('confirmPassword')?.markAsTouched();

      expect(component.getConfirmPasswordError()).toBe('Le password non corrispondono');
    });

    it('should return empty string when no email errors', () => {
      component.signupForm.get('email')?.setValue('valid@email.com');

      expect(component.getEmailError()).toBe('');
    });

    it('should return empty string when no password errors', () => {
      component.signupForm.get('password')?.setValue('validpass1');

      expect(component.getPasswordError()).toBe('');
    });
  });

  describe('Form Getters', () => {
    it('should return email control from getter', () => {
      expect(component.email).toBe(component.signupForm.get('email'));
    });

    it('should return password control from getter', () => {
      expect(component.password).toBe(component.signupForm.get('password'));
    });

    it('should return confirmPassword control from getter', () => {
      expect(component.confirmPassword).toBe(component.signupForm.get('confirmPassword'));
    });
  });
});
