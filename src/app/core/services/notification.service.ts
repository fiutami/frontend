import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationResponse,
  NotificationListResponse,
  UnreadCountResponse,
  MarkAllReadResponse
} from '../models/pet.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // State signals
  private notificationsSignal = signal<NotificationListResponse | null>(null);
  private unreadCountSignal = signal<number>(0);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly hasUnread = computed(() => this.unreadCountSignal() > 0);
  readonly notificationList = computed(() => this.notificationsSignal()?.notifications ?? []);

  private readonly baseUrl = `${environment.apiUrl}/notification`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // Notification Operations
  // ============================================================

  /**
   * Load notifications with pagination
   */
  loadNotifications(page = 1, pageSize = 20): Observable<NotificationListResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<NotificationListResponse>(this.baseUrl, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    }).pipe(
      tap(response => {
        this.notificationsSignal.set(response);
        this.unreadCountSignal.set(response.unreadCount);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || 'Failed to load notifications');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific notification by ID
   */
  getNotification(notificationId: string): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.baseUrl}/${notificationId}`);
  }

  /**
   * Get unread notification count
   */
  loadUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.baseUrl}/unread-count`).pipe(
      tap(response => {
        this.unreadCountSignal.set(response.unreadCount);
      })
    );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Decrement unread count
        const current = this.unreadCountSignal();
        if (current > 0) {
          this.unreadCountSignal.set(current - 1);
        }

        // Update notification in local state
        const currentNotifications = this.notificationsSignal();
        if (currentNotifications) {
          const updated = currentNotifications.notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          );
          this.notificationsSignal.set({
            ...currentNotifications,
            notifications: updated,
            unreadCount: Math.max(0, currentNotifications.unreadCount - 1)
          });
        }
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<MarkAllReadResponse> {
    return this.http.put<MarkAllReadResponse>(`${this.baseUrl}/mark-all-read`, {}).pipe(
      tap(response => {
        this.unreadCountSignal.set(0);

        // Update all notifications in local state
        const currentNotifications = this.notificationsSignal();
        if (currentNotifications) {
          const now = new Date().toISOString();
          const updated = currentNotifications.notifications.map(n => ({
            ...n,
            isRead: true,
            readAt: n.readAt ?? now
          }));
          this.notificationsSignal.set({
            ...currentNotifications,
            notifications: updated,
            unreadCount: 0
          });
        }
      })
    );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${notificationId}`).pipe(
      tap(() => {
        // Remove notification from local state
        const currentNotifications = this.notificationsSignal();
        if (currentNotifications) {
          const toDelete = currentNotifications.notifications.find(n => n.id === notificationId);
          const updated = currentNotifications.notifications.filter(n => n.id !== notificationId);

          // Update unread count if deleted notification was unread
          let newUnreadCount = currentNotifications.unreadCount;
          if (toDelete && !toDelete.isRead) {
            newUnreadCount = Math.max(0, newUnreadCount - 1);
            this.unreadCountSignal.set(newUnreadCount);
          }

          this.notificationsSignal.set({
            ...currentNotifications,
            notifications: updated,
            totalCount: currentNotifications.totalCount - 1,
            unreadCount: newUnreadCount
          });
        }
      })
    );
  }

  // ============================================================
  // State Management
  // ============================================================

  /**
   * Clear all state
   */
  clearState(): void {
    this.notificationsSignal.set(null);
    this.unreadCountSignal.set(0);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
  }
}
