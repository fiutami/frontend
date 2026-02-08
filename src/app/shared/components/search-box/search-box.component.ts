import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * SearchBox - Reusable search input component
 *
 * Features:
 * - Search icon
 * - Placeholder text
 * - Emits search query on input
 * - Glass/solid variants for different backgrounds
 */
@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent {
  @Input() placeholder = 'Cerca...';
  @Input() variant: 'solid' | 'glass' = 'solid';
  @Input() value = '';

  @Output() search = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.search.emit(this.value);
  }
}
