import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SearchResponse, SearchCategory } from '../models/search.models';

const RECENT_SEARCHES_KEY = 'fiutami_recent_searches';
const MAX_RECENT_SEARCHES = 5;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(query: string, category: SearchCategory = 'all', limit: number = 20): Observable<SearchResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('category', category)
      .set('limit', limit.toString());

    return this.http.get<SearchResponse>(this.apiUrl, { params });
  }

  getRecentSearches(): string[] {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveRecentSearch(term: string): void {
    if (!term.trim()) return;

    let recent = this.getRecentSearches();
    recent = recent.filter(r => r !== term);
    recent.unshift(term);
    if (recent.length > MAX_RECENT_SEARCHES) {
      recent = recent.slice(0, MAX_RECENT_SEARCHES);
    }

    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch {
      // Ignore storage errors
    }
  }

  removeRecentSearch(term: string): string[] {
    const recent = this.getRecentSearches().filter(r => r !== term);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch {
      // Ignore storage errors
    }
    return recent;
  }

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
