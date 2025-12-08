import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResponse, LoginCredentials, SignupData, User } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockAuthResponse: AuthResponse = {
    userId: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    hasCompletedOnboarding: false
  };

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    provider: 'email',
    createdAt: new Date().toISOString(),
    hasCompletedOnboarding: false
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login successfully and store auth data', fakeAsync(() => {
      let result: AuthResponse | undefined;

      service.login(credentials).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);

      req.flush(mockAuthResponse);
      tick();

      expect(result).toEqual(mockAuthResponse);
      expect(localStorage.getItem('fiutami_access_token')).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('fiutami_refresh_token')).toBe(mockAuthResponse.refreshToken);
      expect(service.isAuthenticated()).toBe(true);
    }));

    it('should handle login error', fakeAsync(() => {
      let error: Error | undefined;

      service.login(credentials).subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
      tick();

      expect(error).toBeTruthy();
      expect(service.isAuthenticated()).toBe(false);
    }));
  });

  describe('signup', () => {
    const signupData: SignupData = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User'
    };

    it('should signup successfully and store auth data', fakeAsync(() => {
      let result: AuthResponse | undefined;

      service.signup(signupData).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signupData);

      req.flush(mockAuthResponse);
      tick();

      expect(result).toEqual(mockAuthResponse);
      expect(service.isAuthenticated()).toBe(true);
    }));

    it('should handle signup error when email exists', fakeAsync(() => {
      let error: Error | undefined;

      service.signup(signupData).subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
      tick();

      expect(error).toBeTruthy();
    }));
  });

  describe('oauthLogin', () => {
    it('should handle OAuth login successfully', fakeAsync(() => {
      let result: AuthResponse | undefined;

      service.oauthLogin('google', 'google-id-token').subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/oauth`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ provider: 'google', idToken: 'google-id-token' });

      req.flush(mockAuthResponse);
      tick();

      expect(result).toEqual(mockAuthResponse);
      expect(service.isAuthenticated()).toBe(true);

      const user = service.getCurrentUser();
      expect(user?.provider).toBe('google');
    }));
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('fiutami_access_token', 'test-token');
      localStorage.setItem('fiutami_refresh_token', 'test-refresh-token');
      localStorage.setItem('fiutami_user', JSON.stringify(mockUser));
    });

    it('should clear auth data on logout', fakeAsync(() => {
      spyOn(router, 'navigate');

      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/revoke`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true });
      tick();

      expect(localStorage.getItem('fiutami_access_token')).toBeNull();
      expect(localStorage.getItem('fiutami_refresh_token')).toBeNull();
      expect(localStorage.getItem('fiutami_user')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    }));

    it('should handle revoke error gracefully', fakeAsync(() => {
      spyOn(router, 'navigate');

      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/revoke`);
      req.flush({ error: 'Failed' }, { status: 500, statusText: 'Error' });
      tick();

      // Should still clear local data even on error
      expect(localStorage.getItem('fiutami_access_token')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    }));
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      localStorage.setItem('fiutami_refresh_token', 'test-refresh-token');
    });

    it('should refresh token successfully', fakeAsync(() => {
      let result: AuthResponse | undefined;

      service.refreshToken().subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'test-refresh-token' });

      req.flush(mockAuthResponse);
      tick();

      expect(result).toEqual(mockAuthResponse);
      expect(localStorage.getItem('fiutami_access_token')).toBe(mockAuthResponse.accessToken);
    }));
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('fiutami_access_token', 'test-token');
      // Need to recreate service to pick up localStorage state
      const newService = TestBed.inject(AuthService);
      expect(newService.isAuthenticated()).toBe(true);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when no token exists', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return token when it exists', () => {
      localStorage.setItem('fiutami_access_token', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no refresh token exists', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should return refresh token when it exists', () => {
      localStorage.setItem('fiutami_refresh_token', 'test-refresh-token');
      expect(service.getRefreshToken()).toBe('test-refresh-token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user exists', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return user data when it exists', () => {
      localStorage.setItem('fiutami_user', JSON.stringify(mockUser));
      const user = service.getCurrentUser();
      expect(user?.email).toBe(mockUser.email);
      expect(user?.firstName).toBe(mockUser.firstName);
    });
  });

  describe('auth state observables', () => {
    it('should emit auth state changes', fakeAsync(() => {
      const states: boolean[] = [];
      service.authState$.subscribe(state => states.push(state));

      // Initial state
      expect(states[states.length - 1]).toBe(false);

      // Login
      service.login({ email: 'test@example.com', password: 'pass123' }).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
      tick();

      expect(states[states.length - 1]).toBe(true);
    }));

    it('should emit user changes', fakeAsync(() => {
      const users: (User | null)[] = [];
      service.currentUser$.subscribe(user => users.push(user));

      // Initial state
      expect(users[users.length - 1]).toBeNull();

      // Login
      service.login({ email: 'test@example.com', password: 'pass123' }).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
      tick();

      const lastUser = users[users.length - 1];
      expect(lastUser?.email).toBe(mockAuthResponse.email);
    }));
  });

  describe('getProfile', () => {
    it('should fetch user profile', fakeAsync(() => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-123',
        displayName: 'Test User',
        avatarUrl: '',
        bio: 'Test bio',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        dateOfBirth: '',
        updatedAt: new Date().toISOString()
      };

      let result: typeof mockProfile | undefined;

      service.getProfile().subscribe(profile => {
        result = profile;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
      tick();

      expect(result).toEqual(mockProfile);
    }));
  });

  describe('updateProfile', () => {
    it('should update user profile', fakeAsync(() => {
      const updateData = { displayName: 'Updated Name', bio: 'New bio' };
      const mockResponse = {
        id: 'profile-1',
        userId: 'user-123',
        displayName: 'Updated Name',
        avatarUrl: '',
        bio: 'New bio',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        dateOfBirth: '',
        updatedAt: new Date().toISOString()
      };

      let result: typeof mockResponse | undefined;

      service.updateProfile(updateData).subscribe(profile => {
        result = profile;
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
      tick();

      expect(result?.displayName).toBe('Updated Name');
    }));
  });
});
