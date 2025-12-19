import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface PetFriend {
  id: string;
  petName: string;
  ownerName?: string;
  species?: string;
  avatarUrl: string;
  isOnline: boolean;
}

export interface FriendRequest {
  id: string;
  from: PetFriend;
  sentAt: Date;
}

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  searchQuery = '';
  isSelecting = false;
  selectedFriends: Set<string> = new Set();

  friends: PetFriend[] = [
    { id: '1', petName: 'Max', avatarUrl: 'assets/images/pets/max.jpg', isOnline: true },
    { id: '2', petName: 'Charly', avatarUrl: 'assets/images/pets/charly.jpg', isOnline: false },
    { id: '3', petName: 'Trudy', avatarUrl: 'assets/images/pets/trudy.jpg', isOnline: true },
    { id: '4', petName: 'Camilla', avatarUrl: 'assets/images/pets/camilla.jpg', isOnline: false },
    { id: '5', petName: 'Lulu', avatarUrl: 'assets/images/pets/lulu.jpg', isOnline: false },
    { id: '6', petName: 'Rio', avatarUrl: 'assets/images/pets/rio.jpg', isOnline: true },
    { id: '7', petName: 'Silvestro', avatarUrl: 'assets/images/pets/silvestro.jpg', isOnline: false }
  ];

  pendingRequests: FriendRequest[] = [];

  get isEmpty(): boolean {
    return this.friends.length === 0;
  }

  get filteredFriends(): PetFriend[] {
    if (!this.searchQuery.trim()) {
      return this.friends;
    }
    const query = this.searchQuery.toLowerCase();
    return this.friends.filter(f =>
      f.petName.toLowerCase().includes(query) ||
      (f.ownerName && f.ownerName.toLowerCase().includes(query))
    );
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load friends from backend
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  toggleSelecting(): void {
    this.isSelecting = !this.isSelecting;
    if (!this.isSelecting) {
      this.selectedFriends.clear();
    }
  }

  toggleFriendSelection(friend: PetFriend): void {
    if (this.selectedFriends.has(friend.id)) {
      this.selectedFriends.delete(friend.id);
    } else {
      this.selectedFriends.add(friend.id);
    }
  }

  isFriendSelected(friend: PetFriend): boolean {
    return this.selectedFriends.has(friend.id);
  }

  openFriendProfile(friend: PetFriend): void {
    if (this.isSelecting) {
      this.toggleFriendSelection(friend);
    } else {
      console.log('Opening profile for:', friend.petName);
      // this.router.navigate(['/pet', friend.id]);
    }
  }

  acceptRequest(request: FriendRequest): void {
    this.friends.push(request.from);
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
  }

  rejectRequest(request: FriendRequest): void {
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);
  }

  searchFriends(): void {
    // Navigate to search page or open search modal
    console.log('Search for new friends');
  }

  deleteSelected(): void {
    this.friends = this.friends.filter(f => !this.selectedFriends.has(f.id));
    this.selectedFriends.clear();
    this.isSelecting = false;
  }
}
