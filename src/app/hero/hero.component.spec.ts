import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroComponent } from './hero.component';
import { HeroModule } from './hero.module';

function getButton(fixture: ComponentFixture<HeroComponent>, selector: string): HTMLButtonElement {
  return fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
}

describe('HeroComponent mobile-first', () => {
  let fixture: ComponentFixture<HeroComponent>;
  let component: HeroComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders hero variant mobile-v3', () => {
    const section = fixture.nativeElement.querySelector('section.hero-shell') as HTMLElement;
    expect(section).not.toBeNull();
    expect(section.getAttribute('data-variant')).toBe('mobile-v3');
    expect(section.getAttribute('data-layout')).toBe('portrait');
  });

  it('shows current language and toggles the language menu', () => {
    const languageButton = getButton(fixture, '.hero-language__button');
    expect(languageButton.textContent?.trim()).toContain('Italiano');

    languageButton.click();
    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector('.hero-language__menu') as HTMLElement;
    expect(menu).not.toBeNull();
    const options = menu.querySelectorAll('button');
    expect(options.length).toBe(2);
    expect(options[1].textContent?.trim()).toBe('English');
  });

  it('updates claim when switching language', () => {
    const languageButton = getButton(fixture, '.hero-language__button');
    languageButton.click();
    fixture.detectChanges();

    const optionButtons = fixture.nativeElement.querySelectorAll('.hero-language__menu button') as NodeListOf<HTMLButtonElement>;
    optionButtons[1].click();
    fixture.detectChanges();

    const claim = fixture.nativeElement.querySelector('.hero-claim') as HTMLElement;
    expect(claim.textContent?.trim()).toBe('Sniff your perfect match');
  });

  it('emits login and register events', () => {
    spyOn(component.login, 'emit');
    spyOn(component.register, 'emit');

    getButton(fixture, '.hero-cta--primary').click();
    getButton(fixture, '.hero-cta--secondary').click();

    expect(component.login.emit).toHaveBeenCalledTimes(1);
    expect(component.register.emit).toHaveBeenCalledTimes(1);
  });

  it('emits languageChanged when selecting a different language', () => {
    spyOn(component.languageChanged, 'emit');
    const languageButton = getButton(fixture, '.hero-language__button');
    languageButton.click();
    fixture.detectChanges();

    const englishButton = fixture.nativeElement.querySelectorAll('.hero-language__menu button')[1] as HTMLButtonElement;
    englishButton.click();
    fixture.detectChanges();

    expect(component.languageChanged.emit).toHaveBeenCalledWith('en');
  });

  it('emits socialSelected for providers', () => {
    spyOn(component.socialSelected, 'emit');
    const socialButtons = fixture.nativeElement.querySelectorAll('.hero-social__button') as NodeListOf<HTMLButtonElement>;
    expect(socialButtons.length).toBe(2);

    socialButtons[0].click();
    socialButtons[1].click();

    expect(component.socialSelected.emit).toHaveBeenCalledWith('apple');
    expect(component.socialSelected.emit).toHaveBeenCalledWith('google');
  });

  it('sets intrinsic dimensions on illustration image', () => {
    const image = fixture.nativeElement.querySelector('.hero-illustration__image') as HTMLImageElement;
    expect(image.getAttribute('width')).toBe(String(component.heroIllustration.width));
    expect(image.getAttribute('height')).toBe(String(component.heroIllustration.height));
  });

  it('renders legal links with external target', () => {
    const links = fixture.nativeElement.querySelectorAll('.hero-legal__link') as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(2);
    links.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });
});
