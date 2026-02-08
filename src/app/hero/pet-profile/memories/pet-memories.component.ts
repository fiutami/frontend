import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  icon: string;
  category: 'milestone' | 'event' | 'health';
}

@Component({
  selector: 'app-pet-memories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pet-memories.component.html',
  styleUrls: ['./pet-memories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetMemoriesComponent {
  // State signals
  isLoading = signal(false);
  memories = signal<MemoryItem[]>([
    // Mock data - replace with API call
    {
      id: '1',
      title: 'Prima Passeggiata',
      description: 'La prima passeggiata al parco insieme!',
      date: new Date('2024-01-15'),
      icon: 'directions_walk',
      category: 'milestone',
    },
    {
      id: '2',
      title: 'Compleanno',
      description: 'Festeggiato il primo compleanno con torta speciale',
      date: new Date('2024-06-10'),
      icon: 'cake',
      category: 'event',
    },
    {
      id: '3',
      title: 'Vaccinazione',
      description: 'Completato ciclo vaccinazioni annuali',
      date: new Date('2024-09-20'),
      icon: 'vaccines',
      category: 'health',
    },
  ]);

  get isEmpty(): boolean {
    return this.memories().length === 0;
  }

  goBack(): void {
    window.history.back();
  }

  onMemoryClick(memory: MemoryItem): void {
    // Navigate to memory detail
    console.log('Memory clicked:', memory);
  }

  onAddMemoryClick(): void {
    // Navigate to add memory form
    console.log('Add memory clicked');
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      milestone: '#4CAF50',
      event: '#FF9800',
      health: '#2196F3',
    };
    return colors[category] || '#9E9E9E';
  }
}
