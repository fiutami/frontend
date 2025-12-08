import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-video',
  templateUrl: './hero-video.component.html',
  styleUrls: ['./hero-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroVideoComponent implements AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  @Output() loginClick = new EventEmitter<void>();
  @Output() signupClick = new EventEmitter<void>();
  @Output() socialLoginClick = new EventEmitter<'apple' | 'facebook' | 'google'>();
  @Output() languageClick = new EventEmitter<void>();

  private readonly platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    if (this.isBrowser() && this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.muted = true;
      video.play().catch(() => {
        // Autoplay blocked
      });
    }
  }

  onLoginClick(): void {
    this.loginClick.emit();
    this.router.navigate(['/auth/login']);
  }

  onSignupClick(): void {
    this.signupClick.emit();
    this.router.navigate(['/auth/signup']);
  }

  onSocialLoginClick(provider: 'apple' | 'facebook' | 'google'): void {
    this.socialLoginClick.emit(provider);
  }

  onLanguageClick(): void {
    this.languageClick.emit();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
