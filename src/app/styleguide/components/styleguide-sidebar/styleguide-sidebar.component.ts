import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryConfig, ComponentDemoConfig } from '../../models/component-config.models';

@Component({
  selector: 'app-styleguide-sidebar',
  templateUrl: './styleguide-sidebar.component.html',
  styleUrls: ['./styleguide-sidebar.component.scss']
})
export class StyleguideSidebarComponent {
  @Input() categories: CategoryConfig[] = [];
  @Input() components: ComponentDemoConfig[] = [];
  @Input() selectedCategory: string = '';
  @Input() selectedComponentId: string = '';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() componentSelect = new EventEmitter<string>();

  expandedCategories: Set<string> = new Set();

  ngOnInit() {
    // Expand selected category by default
    if (this.selectedCategory) {
      this.expandedCategories.add(this.selectedCategory);
    }
  }

  toggleCategory(categoryId: string): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  getComponentsForCategory(categoryId: string): ComponentDemoConfig[] {
    return this.components.filter(c => c.category === categoryId);
  }

  selectComponent(componentId: string, categoryId: string): void {
    this.selectedComponentId = componentId;
    this.selectedCategory = categoryId;
    this.expandedCategories.add(categoryId);
    this.componentSelect.emit(componentId);
    this.categoryChange.emit(categoryId);
  }
}
