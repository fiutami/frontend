import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent implements OnInit {
  user: User | null = null;
  isSidebarOpen = false;

  navItems: NavItem[] = [
    { path: 'dashboard', icon: 'home', label: 'Dashboard' },
    { path: 'profile', icon: 'user', label: 'Profilo' },
    { path: 'settings', icon: 'settings', label: 'Impostazioni' },
    { path: 'security', icon: 'shield', label: 'Sicurezza' },
    { path: 'account', icon: 'account', label: 'Account' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  get userInitials(): string {
    if (!this.user) return '?';
    const first = this.user.firstName?.[0] || '';
    const last = this.user.lastName?.[0] || '';
    return (first + last).toUpperCase() || this.user.email[0].toUpperCase();
  }

  get userName(): string {
    if (!this.user) return '';
    return [this.user.firstName, this.user.lastName].filter(Boolean).join(' ') || this.user.email;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
