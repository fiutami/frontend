import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface FunFact {
  id: string;
  title: string;
  description: string;
  category: 'behavior' | 'health' | 'history' | 'curiosity';
  icon: string;
}

@Component({
  selector: 'app-fatti-bestiali',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fatti-bestiali.component.html',
  styleUrls: ['./fatti-bestiali.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FattiBestialiComponent {
  // State signals
  isLoading = signal(false);
  facts = signal<FunFact[]>([
    // Mock data - in production, these would be AI-generated based on pet species
    {
      id: '1',
      title: 'Super Olfatto',
      description: 'Sapevi che i Labrador hanno circa 220 milioni di recettori olfattivi? Possono rilevare odori fino a 100.000 volte meglio degli umani!',
      category: 'curiosity',
      icon: 'pets',
    },
    {
      id: '2',
      title: 'Coda Comunicativa',
      description: 'La coda del tuo pet non serve solo per equilibrio! È uno strumento di comunicazione complesso che esprime emozioni e stati d\'animo.',
      category: 'behavior',
      icon: 'sentiment_satisfied_alt',
    },
    {
      id: '3',
      title: 'Origini Antiche',
      description: 'I Labrador Retriever provengono dall\'isola di Terranova, dove aiutavano i pescatori a recuperare le reti e i pesci sfuggiti.',
      category: 'history',
      icon: 'history_edu',
    },
    {
      id: '4',
      title: 'Amici dell\'Acqua',
      description: 'I Labrador hanno membrane tra le dita delle zampe che li rendono nuotatori eccellenti. Adorano l\'acqua per natura!',
      category: 'curiosity',
      icon: 'pool',
    },
  ]);

  get isEmpty(): boolean {
    return this.facts().length === 0;
  }

  goBack(): void {
    window.history.back();
  }

  onRefreshClick(): void {
    // Trigger AI to generate new facts
    console.log('Refresh facts clicked');
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      behavior: 'Comportamento',
      health: 'Salute',
      history: 'Storia',
      curiosity: 'Curiosità',
    };
    return labels[category] || 'Info';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      behavior: '#FF9800',
      health: '#4CAF50',
      history: '#9C27B0',
      curiosity: '#2196F3',
    };
    return colors[category] || '#9E9E9E';
  }
}
