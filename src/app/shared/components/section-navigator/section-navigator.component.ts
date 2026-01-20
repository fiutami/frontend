import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SectionItem {
  id: string;
  title: string;
}

@Component({
  selector: 'app-section-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-navigator.component.html',
  styleUrls: ['./section-navigator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionNavigatorComponent {
  private _sections = signal<SectionItem[]>([]);
  private _currentIndex = signal<number>(0);

  @Input()
  set sections(value: SectionItem[]) {
    this._sections.set(value);
  }

  @Input()
  set currentIndex(value: number) {
    this._currentIndex.set(value);
  }

  @Output() indexChange = new EventEmitter<number>();

  readonly currentSection = computed(() => {
    const sections = this._sections();
    const index = this._currentIndex();
    return sections[index] ?? { id: '', title: '' };
  });

  readonly canGoPrev = computed(() => this._currentIndex() > 0);
  readonly canGoNext = computed(() => this._currentIndex() < this._sections().length - 1);

  prev(): void {
    if (this.canGoPrev()) {
      this.indexChange.emit(this._currentIndex() - 1);
    }
  }

  next(): void {
    if (this.canGoNext()) {
      this.indexChange.emit(this._currentIndex() + 1);
    }
  }
}
