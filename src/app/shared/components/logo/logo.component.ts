import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

export type LogoVariant = 'color' | 'white' | 'dark';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  /** Logo color variant */
  @Input() variant: LogoVariant = 'color';

  /** Logo size preset */
  @Input() size: LogoSize = 'md';

  /** Loading strategy */
  @Input() loading: 'lazy' | 'eager' = 'lazy';

  /** Custom height (overrides size preset) */
  @Input() height?: string;

  /** External link (optional) */
  @Input() href?: string;

  /** Link target */
  @Input() target: '_blank' | '_self' = '_blank';

  get logoSrc(): string {
    switch (this.variant) {
      case 'white':
        return 'assets/Logo/fiutami-mono.svg';
      case 'dark':
        return 'assets/Logo/fiutami-mono-2.svg';
      case 'color':
      default:
        return 'assets/Logo/fiutami.svg';
    }
  }

  get logoClasses(): string[] {
    return [
      'logo',
      `logo--${this.size}`,
    ];
  }

  get customStyles(): { [key: string]: string } | null {
    if (this.height) {
      return { height: this.height };
    }
    return null;
  }
}
