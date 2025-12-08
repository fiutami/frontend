import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PropConfig } from '../../models/component-config.models';

@Component({
  selector: 'app-prop-controls',
  templateUrl: './prop-controls.component.html',
  styleUrls: ['./prop-controls.component.scss']
})
export class PropControlsComponent {
  @Input() props: PropConfig[] = [];
  @Input() values: Record<string, any> = {};

  @Output() valueChange = new EventEmitter<{ prop: string; value: any }>();

  onValueChange(propName: string, value: any): void {
    this.valueChange.emit({ prop: propName, value });
  }

  onBooleanChange(propName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit({ prop: propName, value: target.checked });
  }

  onSelectChange(propName: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit({ prop: propName, value: target.value });
  }

  onNumberChange(propName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit({ prop: propName, value: Number(target.value) });
  }

  onTextChange(propName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit({ prop: propName, value: target.value });
  }
}
