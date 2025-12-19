import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface SavedCategory {
  id: string;
  type: 'trainers' | 'places' | 'vets' | 'pharmacies' | 'breeders' | 'sitters';
  title: string;
  imageUrl: string;
  count: number;
}

export interface SavedItem {
  id: string;
  type: 'trainer' | 'place' | 'vet' | 'pharmacy' | 'breeder' | 'sitter';
  title: string;
  subtitle: string;
  imageUrl?: string;
  savedAt: Date;
}

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {
  searchQuery = '';

  categories: SavedCategory[] = [
    { id: '1', type: 'trainers', title: 'Addestratori', imageUrl: 'assets/images/saved/trainers.jpg', count: 3 },
    { id: '2', type: 'places', title: 'Luoghi Pet', imageUrl: 'assets/images/saved/places.jpg', count: 5 },
    { id: '3', type: 'vets', title: 'Veterinari', imageUrl: 'assets/images/saved/vets.jpg', count: 2 },
    { id: '4', type: 'pharmacies', title: 'Farmacie', imageUrl: 'assets/images/saved/pharmacies.jpg', count: 1 },
    { id: '5', type: 'breeders', title: 'Allevatori', imageUrl: 'assets/images/saved/breeders.jpg', count: 0 },
    { id: '6', type: 'sitters', title: 'Dog/cat sitter', imageUrl: 'assets/images/saved/sitters.jpg', count: 4 }
  ];

  get isEmpty(): boolean {
    return this.categories.every(c => c.count === 0);
  }

  get filteredCategories(): SavedCategory[] {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }
    const query = this.searchQuery.toLowerCase();
    return this.categories.filter(c =>
      c.title.toLowerCase().includes(query)
    );
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load saved categories from backend
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  openCategory(category: SavedCategory): void {
    // Navigate to category detail or show items
    console.log('Opening category:', category.type);
  }

  editCategory(category: SavedCategory, event: Event): void {
    event.stopPropagation();
    console.log('Editing category:', category.type);
  }

  addNew(): void {
    // Open add new saved item modal/page
    console.log('Add new saved item');
  }

  explorePlaces(): void {
    this.router.navigate(['/map']);
  }
}
