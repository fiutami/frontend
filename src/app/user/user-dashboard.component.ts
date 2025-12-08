import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../core/services/auth.service';
import { SessionService, UserSession } from '../core/services/session.service';

interface DashboardStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="dashboard">
      <h1 class="dashboard__title">Dashboard</h1>
      <p class="dashboard__subtitle">Benvenuto, {{ userName }}!</p>

      <!-- Stats Cards -->
      <div class="dashboard__stats">
        <div *ngFor="let stat of stats" class="stat-card" [style.borderColor]="stat.color">
          <div class="stat-card__icon" [style.backgroundColor]="stat.color + '20'" [style.color]="stat.color">
            <svg *ngIf="stat.icon === 'calendar'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <svg *ngIf="stat.icon === 'devices'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <svg *ngIf="stat.icon === 'shield'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <svg *ngIf="stat.icon === 'user'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__value">{{ stat.value }}</span>
            <span class="stat-card__label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <section class="dashboard__section">
        <h2 class="dashboard__section-title">Azioni Rapide</h2>
        <div class="quick-actions">
          <a routerLink="/user/profile" class="quick-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Modifica Profilo</span>
          </a>
          <a routerLink="/user/settings" class="quick-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Impostazioni</span>
          </a>
          <a routerLink="/user/security" class="quick-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Sicurezza</span>
          </a>
        </div>
      </section>

      <!-- Recent Sessions -->
      <section class="dashboard__section">
        <h2 class="dashboard__section-title">Sessioni Recenti</h2>
        <div class="sessions-list" *ngIf="recentSessions.length > 0; else noSessions">
          <div *ngFor="let session of recentSessions" class="session-item">
            <div class="session-item__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div class="session-item__details">
              <span class="session-item__device">{{ session.browser }} - {{ session.operatingSystem }}</span>
              <span class="session-item__location">{{ session.city || 'Sconosciuto' }} - {{ session.lastActivityAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <span *ngIf="session.isCurrent" class="session-item__badge">Attuale</span>
          </div>
        </div>
        <ng-template #noSessions>
          <p class="dashboard__empty">Nessuna sessione attiva</p>
        </ng-template>
        <a routerLink="/user/security" class="dashboard__link">Gestisci tutte le sessioni</a>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1000px;
    }

    .dashboard__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 0.5rem;
    }

    .dashboard__subtitle {
      font-size: 1rem;
      color: #7f8c8d;
      margin: 0 0 2rem;
    }

    .dashboard__stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid transparent;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .stat-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card__content {
      display: flex;
      flex-direction: column;
    }

    .stat-card__value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-card__label {
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .dashboard__section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .dashboard__section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 1rem;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .quick-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #f8f9fa;
      color: #2c3e50;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: #F5A623;
        color: white;

        svg {
          stroke: white;
        }
      }
    }

    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .session-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .session-item__icon {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #5a6c7d;
    }

    .session-item__details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .session-item__device {
      font-weight: 500;
      color: #2c3e50;
    }

    .session-item__location {
      font-size: 0.8125rem;
      color: #7f8c8d;
    }

    .session-item__badge {
      padding: 0.25rem 0.75rem;
      background: #27ae60;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 100px;
    }

    .dashboard__empty {
      color: #7f8c8d;
      text-align: center;
      padding: 1rem;
    }

    .dashboard__link {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: #F5A623;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  user: User | null = null;
  stats: DashboardStat[] = [];
  recentSessions: UserSession[] = [];

  constructor(
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadStats();
    this.loadRecentSessions();
  }

  get userName(): string {
    if (!this.user) return '';
    return this.user.firstName || this.user.email.split('@')[0];
  }

  private loadStats(): void {
    const memberSince = this.user?.createdAt ? new Date(this.user.createdAt) : new Date();
    const daysSinceJoin = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24));

    this.stats = [
      {
        label: 'Giorni da iscrizione',
        value: daysSinceJoin,
        icon: 'calendar',
        color: '#F5A623'
      },
      {
        label: 'Sessioni attive',
        value: '-',
        icon: 'devices',
        color: '#4A90E2'
      },
      {
        label: 'Livello sicurezza',
        value: this.user?.provider === 'google' ? 'Alto' : 'Medio',
        icon: 'shield',
        color: '#27ae60'
      },
      {
        label: 'Stato profilo',
        value: this.getProfileCompletion(),
        icon: 'user',
        color: '#9b59b6'
      }
    ];
  }

  private getProfileCompletion(): string {
    if (!this.user) return '0%';
    let completed = 1; // email is always present
    if (this.user.firstName) completed++;
    if (this.user.lastName) completed++;
    // Profile is 3 main fields for now (email, firstName, lastName)
    return `${Math.round((completed / 3) * 100)}%`;
  }

  private loadRecentSessions(): void {
    this.sessionService.loadSessions().subscribe({
      next: (response) => {
        this.recentSessions = response.sessions.slice(0, 3);
        // Update stats with actual session count
        const sessionsStatIndex = this.stats.findIndex(s => s.icon === 'devices');
        if (sessionsStatIndex >= 0) {
          this.stats[sessionsStatIndex].value = response.totalCount;
        }
      },
      error: () => {
        // Silently fail - sessions are optional
      }
    });
  }
}
