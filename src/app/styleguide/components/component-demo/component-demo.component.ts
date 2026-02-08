import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ComponentDemoConfig } from '../../models/component-config.models';
import { SampleDataService } from '../../services/sample-data.service';

@Component({
  selector: 'app-component-demo',
  templateUrl: './component-demo.component.html',
  styleUrls: ['./component-demo.component.scss']
})
export class ComponentDemoComponent implements OnChanges {
  @Input() config!: ComponentDemoConfig;

  propValues: Record<string, any> = {};
  contentValue: string = '';
  darkBackground: boolean = false;

  constructor(public sampleData: SampleDataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.initializeProps();
    }
  }

  private initializeProps(): void {
    this.propValues = {};
    for (const prop of this.config.props) {
      this.propValues[prop.name] = prop.defaultValue;
    }
    this.contentValue = this.config.defaultContent || '';
  }

  onPropChange(event: { prop: string; value: any }): void {
    this.propValues = {
      ...this.propValues,
      [event.prop]: event.value
    };
  }

  toggleBackground(): void {
    this.darkBackground = !this.darkBackground;
  }

  onContentChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.contentValue = target.value;
  }
}
