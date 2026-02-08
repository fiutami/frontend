import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomeStartComponent } from './home-start.component';

describe('HomeStartComponent', () => {
  let component: HomeStartComponent;
  let fixture: ComponentFixture<HomeStartComponent>;
  let router: Router;
  let compiled: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [HomeStartComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeStartComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default properties', () => {
      expect(component).toBeDefined();
      expect(fixture.componentInstance).toBeInstanceOf(HomeStartComponent);
    });

    it('should set up component without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Template Rendering', () => {
    it('should render the main container', () => {
      const container = compiled.querySelector('.home-start');
      expect(container).toBeTruthy();
    });

    it('should render the logo', () => {
      const logo = compiled.querySelector('.home-start__logo');
      expect(logo).toBeTruthy();
    });

    it('should render logo image with correct alt text', () => {
      const logoImg = compiled.querySelector('.home-start__logo-img');
      expect(logoImg).toBeTruthy();
      expect(logoImg?.getAttribute('alt')).toBe('FiutaMi');
    });

    it('should render the tagline', () => {
      const tagline = compiled.querySelector('.home-start__tagline');
      expect(tagline).toBeTruthy();
    });

    it('should render the mascot', () => {
      const mascot = compiled.querySelector('.home-start__mascot');
      expect(mascot).toBeTruthy();
    });

    it('should render the branding section', () => {
      const branding = compiled.querySelector('.home-start__branding');
      expect(branding).toBeTruthy();
    });

    it('should render app-language-switcher', () => {
      const languageSwitcher = compiled.querySelector('app-language-switcher');
      expect(languageSwitcher).toBeTruthy();
    });

    it('should render app-auth-card', () => {
      const authCard = compiled.querySelector('app-auth-card');
      expect(authCard).toBeTruthy();
    });

    it('should render app-button components', () => {
      const buttons = compiled.querySelectorAll('app-button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render terms link', () => {
      const termsLink = compiled.querySelector('a[href="/terms"]');
      expect(termsLink).toBeTruthy();
    });

    it('should render privacy link', () => {
      const privacyLink = compiled.querySelector('a[href="/privacy"]');
      expect(privacyLink).toBeTruthy();
    });
  });

  describe('Component Methods', () => {
    it('should navigate to /login when onLoginClick is called', () => {
      spyOn(router, 'navigate');
      component.onLoginClick();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to /signup when onSignupClick is called', () => {
      spyOn(router, 'navigate');
      component.onSignupClick();
      expect(router.navigate).toHaveBeenCalledWith(['/signup']);
    });

    it('should emit loginClick when onLoginClick is called', () => {
      spyOn(component.loginClick, 'emit');
      spyOn(router, 'navigate');
      component.onLoginClick();
      expect(component.loginClick.emit).toHaveBeenCalled();
    });

    it('should emit signupClick when onSignupClick is called', () => {
      spyOn(component.signupClick, 'emit');
      spyOn(router, 'navigate');
      component.onSignupClick();
      expect(component.signupClick.emit).toHaveBeenCalled();
    });

    it('should emit languageClick when onLanguageClick is called', () => {
      spyOn(component.languageClick, 'emit');
      component.onLanguageClick();
      expect(component.languageClick.emit).toHaveBeenCalled();
    });
  });

  describe('Event Emitters', () => {
    it('should have loginClick EventEmitter', () => {
      expect(component.loginClick).toBeTruthy();
    });

    it('should have signupClick EventEmitter', () => {
      expect(component.signupClick).toBeTruthy();
    });

    it('should have languageClick EventEmitter', () => {
      expect(component.languageClick).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for mascot', () => {
      const mascot = compiled.querySelector('.home-start__mascot');
      expect(mascot?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have presentation role on decorative images', () => {
      const dogImage = compiled.querySelector('.home-start__dog-image');
      expect(dogImage?.getAttribute('role')).toBe('presentation');
    });
  });
});
