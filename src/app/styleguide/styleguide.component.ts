import { Component, OnInit } from '@angular/core';
import { ComponentRegistryService } from './services/component-registry.service';
import { ComponentDemoConfig, CategoryConfig } from './models/component-config.models';

@Component({
  selector: 'app-styleguide',
  templateUrl: './styleguide.component.html',
  styleUrls: ['./styleguide.component.scss']
})
export class StyleguideComponent implements OnInit {
  categories: CategoryConfig[] = [];
  components: ComponentDemoConfig[] = [];
  selectedCategory: string = '';
  selectedComponentId: string = '';
  selectedComponent: ComponentDemoConfig | null = null;

  constructor(private registry: ComponentRegistryService) {}

  ngOnInit(): void {
    this.categories = this.registry.categories;
    this.components = this.registry.components;

    // Select first component by default
    if (this.components.length > 0) {
      this.selectComponent(this.components[0].id);
    }
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  selectComponent(componentId: string): void {
    this.selectedComponentId = componentId;
    this.selectedComponent = this.registry.getComponentById(componentId) || null;
    if (this.selectedComponent) {
      this.selectedCategory = this.selectedComponent.category;
    }
  }
}
