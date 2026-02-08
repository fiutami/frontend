import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

export type CardVariant = 'overlay' | 'solid' | 'transparent';
export type CardPadding = 'sm' | 'md' | 'lg' | 'none';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() variant: CardVariant = 'overlay';
  @Input() padding: CardPadding = 'md';
  @Input() rounded = true;

  get cardClasses(): string[] {
    const classes = ['card', `card--${this.variant}`, `card--padding-${this.padding}`];

    if (this.rounded) {
      classes.push('card--rounded');
    }

    return classes;
  }
}
