import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
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

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule
      ],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(LoginComponent, {
      set: { template: '<form [formGroup]="loginForm"><input formControlName="email"><input formControlName="password"></form>' }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize login form with empty fields', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have email and password form controls', () => {
      expect(component.loginForm.contains('email')).toBeTruthy();
      expect(component.loginForm.contains('password')).toBeTruthy();
    });

    it('should initialize with error message as empty string', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize with submitting state as false', () => {
      expect(component.isSubmitting).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should make email required', () => {
      const email = component.loginForm.get('email');
      email?.setValue('');
      expect(email?.hasError('required')).toBeTruthy();
    });

    it('should validate email format', () => {
      const email = component.loginForm.get('email');

      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBeTruthy();

      email?.setValue('valid@email.com');
      expect(email?.hasError('email')).toBeFalsy();
    });

    it('should accept valid email formats', () => {
      const email = component.loginForm.get('email');
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com'
      ];

      validEmails.forEach(validEmail => {
        email?.setValue(validEmail);
        expect(email?.valid).toBeTruthy();
      });
    });

    it('should reject invalid email formats', () => {
      const email = component.loginForm.get('email');
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

    it('should make password required', () => {
      const password = component.loginForm.get('password');
      password?.setValue('');
      expect(password?.hasError('required')).toBeTruthy();
    });

    it('should validate password minimum length', () => {
      const password = component.loginForm.get('password');

      password?.setValue('123');
      expect(password?.hasError('minlength')).toBeTruthy();

      password?.setValue('123456');
      expect(password?.hasError('minlength')).toBeFalsy();
    });

    it('should invalidate form when fields are empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should validate form when all fields are correct', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBeTruthy();
    });
  });

  describe('Login Submission', () => {
    it('should emit loginSubmit event on valid form submit', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      component.loginForm.patchValue(credentials);
      authService.login.and.returnValue(of(mockAuthResponse));
      spyOn(component.loginSubmit, 'emit');

      component.onSubmit();

      expect(component.loginSubmit.emit).toHaveBeenCalledWith(credentials);
    });

    it('should not emit event when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: ''
      });
      spyOn(component.loginSubmit, 'emit');

      component.onSubmit();

      expect(component.loginSubmit.emit).not.toHaveBeenCalled();
    });

    it('should set isSubmitting to true on valid submit', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      authService.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(component.isSubmitting).toBeTruthy();
    });

    it('should not submit when already submitting', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      component.isSubmitting = true;
      spyOn(component.loginSubmit, 'emit');

      component.onSubmit();

      expect(component.loginSubmit.emit).not.toHaveBeenCalled();
    });

    it('should call authService.login with credentials', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      component.loginForm.patchValue(credentials);
      authService.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith(credentials);
    });

    it('should navigate to /home on successful login', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      authService.login.and.returnValue(of(mockAuthResponse));
      spyOn(router, 'navigate');

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should set error message on login failure', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      authService.login.and.returnValue(throwError(() => ({
        error: { message: 'Invalid credentials' }
      })));

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
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

  describe('Forgot Password', () => {
    it('should emit forgotPasswordClick event when called', () => {
      spyOn(component.forgotPasswordClick, 'emit');

      component.onForgotPasswordClick();

      expect(component.forgotPasswordClick.emit).toHaveBeenCalled();
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
      component.loginForm.get('email')?.setValue('');
      component.loginForm.get('email')?.markAsTouched();

      expect(component.getEmailError()).toBe('Email obbligatoria');
    });

    it('should return email format error message', () => {
      component.loginForm.get('email')?.setValue('invalid-email');
      component.loginForm.get('email')?.markAsTouched();

      expect(component.getEmailError()).toBe("Inserisci un'email valida");
    });

    it('should return password required error message', () => {
      component.loginForm.get('password')?.setValue('');
      component.loginForm.get('password')?.markAsTouched();

      expect(component.getPasswordError()).toBe('Password obbligatoria');
    });

    it('should return password minlength error message', () => {
      component.loginForm.get('password')?.setValue('123');
      component.loginForm.get('password')?.markAsTouched();

      expect(component.getPasswordError()).toBe('Password minimo 6 caratteri');
    });

    it('should return empty string when no email errors', () => {
      component.loginForm.get('email')?.setValue('valid@email.com');

      expect(component.getEmailError()).toBe('');
    });

    it('should return empty string when no password errors', () => {
      component.loginForm.get('password')?.setValue('validpassword');

      expect(component.getPasswordError()).toBe('');
    });
  });

  describe('Form Getters', () => {
    it('should return email control from getter', () => {
      expect(component.email).toBe(component.loginForm.get('email'));
    });

    it('should return password control from getter', () => {
      expect(component.password).toBe(component.loginForm.get('password'));
    });
  });
});
