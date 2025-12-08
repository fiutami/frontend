import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';
import {
  NotificationResponse,
  NotificationListResponse,
  UnreadCountResponse,
  MarkAllReadResponse
} from '../models/pet.models';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/notification`;

  const mockNotification: NotificationResponse = {
    id: 'notif-1',
    type: 'system',
    title: 'Test Notification',
    message: 'Test message content',
    actionUrl: null,
    imageUrl: null,
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString()
  };

  const mockNotificationListResponse: NotificationListResponse = {
    notifications: [
      { ...mockNotification, id: 'notif-1', isRead: false },
      { ...mockNotification, id: 'notif-2', isRead: true, readAt: new Date().toISOString() },
      { ...mockNotification, id: 'notif-3', isRead: false }
    ],
    totalCount: 3,
    unreadCount: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================================
  // Signal State Tests
  // ============================================================

  describe('Signal State', () => {
    it('should initialize with null notifications signal', () => {
      expect(service.notifications()).toBeNull();
    });

    it('should initialize with 0 unreadCount', () => {
      expect(service.unreadCount()).toBe(0);
    });

    it('should have false loading signal initially', () => {
      expect(service.loading()).toBeFalse();
    });

    it('should have null error signal initially', () => {
      expect(service.error()).toBeNull();
    });

    it('should compute hasUnread as false when unreadCount is 0', () => {
      expect(service.hasUnread()).toBeFalse();
    });

    it('should compute notificationList as empty array when no notifications', () => {
      expect(service.notificationList()).toEqual([]);
    });
  });

  // ============================================================
  // loadNotifications() Tests
  // ============================================================

  describe('loadNotifications()', () => {
    it('should GET from correct endpoint with pagination params', () => {
      service.loadNotifications(1, 20).subscribe();

      const req = httpMock.expectOne(r => r.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush(mockNotificationListResponse);
    });

    it('should set loading to true during request', () => {
      service.loadNotifications().subscribe();
      expect(service.loading()).toBeTrue();

      httpMock.expectOne(r => r.url === baseUrl).flush(mockNotificationListResponse);
      expect(service.loading()).toBeFalse();
    });

    it('should update notifications and unreadCount on success', fakeAsync(() => {
      service.loadNotifications().subscribe();
      httpMock.expectOne(r => r.url === baseUrl).flush(mockNotificationListResponse);
      tick();

      expect(service.notifications()).toEqual(mockNotificationListResponse);
      expect(service.unreadCount()).toBe(2);
      expect(service.hasUnread()).toBeTrue();
      expect(service.notificationList().length).toBe(3);
    }));

    it('should set error on failure', fakeAsync(() => {
      service.loadNotifications().subscribe({ error: () => {} });
      httpMock.expectOne(r => r.url === baseUrl).flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Error' }
      );
      tick();

      // Service uses error?.error?.message || 'Failed to load notifications'
      expect(service.error()).not.toBeNull();
      expect(service.loading()).toBeFalse();
    }));

    it('should use default pagination values', () => {
      service.loadNotifications().subscribe();

      const req = httpMock.expectOne(r => r.url === baseUrl);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush(mockNotificationListResponse);
    });
  });

  // ============================================================
  // getNotification() Tests
  // ============================================================

  describe('getNotification()', () => {
    it('should GET from correct endpoint', () => {
      service.getNotification('notif-1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/notif-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNotification);
    });
  });

  // ============================================================
  // loadUnreadCount() Tests
  // ============================================================

  describe('loadUnreadCount()', () => {
    it('should GET from unread-count endpoint', () => {
      service.loadUnreadCount().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/unread-count`);
      expect(req.request.method).toBe('GET');
      req.flush({ unreadCount: 5 } as UnreadCountResponse);
    });

    it('should update unreadCount signal', fakeAsync(() => {
      service.loadUnreadCount().subscribe();
      httpMock.expectOne(`${baseUrl}/unread-count`).flush({ unreadCount: 5 });
      tick();

      expect(service.unreadCount()).toBe(5);
      expect(service.hasUnread()).toBeTrue();
    }));
  });

  // ============================================================
  // markAsRead() Tests
  // ============================================================

  describe('markAsRead()', () => {
    beforeEach(fakeAsync(() => {
      // Pre-load notifications
      service.loadNotifications().subscribe();
      httpMock.expectOne(r => r.url === baseUrl).flush(mockNotificationListResponse);
      tick();
    }));

    it('should PUT to correct endpoint', () => {
      service.markAsRead('notif-1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/notif-1/read`);
      expect(req.request.method).toBe('PUT');
      req.flush(null);
    });

    it('should decrement unreadCount signal', fakeAsync(() => {
      const initialCount = service.unreadCount();

      service.markAsRead('notif-1').subscribe();
      httpMock.expectOne(`${baseUrl}/notif-1/read`).flush(null);
      tick();

      expect(service.unreadCount()).toBe(initialCount - 1);
    }));

    it('should update notification in local state to read', fakeAsync(() => {
      service.markAsRead('notif-1').subscribe();
      httpMock.expectOne(`${baseUrl}/notif-1/read`).flush(null);
      tick();

      const notification = service.notificationList().find(n => n.id === 'notif-1');
      expect(notification?.isRead).toBeTrue();
      expect(notification?.readAt).not.toBeNull();
    }));

    it('should not go below 0 unreadCount', fakeAsync(() => {
      // Mark all as read first
      service.markAllAsRead().subscribe();
      httpMock.expectOne(`${baseUrl}/mark-all-read`).flush({ markedCount: 2 } as MarkAllReadResponse);
      tick();
      expect(service.unreadCount()).toBe(0);

      // Try marking again
      service.markAsRead('notif-1').subscribe();
      httpMock.expectOne(`${baseUrl}/notif-1/read`).flush(null);
      tick();

      expect(service.unreadCount()).toBe(0);
    }));
  });

  // ============================================================
  // markAllAsRead() Tests
  // ============================================================

  describe('markAllAsRead()', () => {
    beforeEach(fakeAsync(() => {
      service.loadNotifications().subscribe();
      httpMock.expectOne(r => r.url === baseUrl).flush(mockNotificationListResponse);
      tick();
    }));

    it('should PUT to mark-all-read endpoint', () => {
      service.markAllAsRead().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/mark-all-read`);
      expect(req.request.method).toBe('PUT');
      req.flush({ markedCount: 2 } as MarkAllReadResponse);
    });

    it('should set unreadCount to 0', fakeAsync(() => {
      service.markAllAsRead().subscribe();
      httpMock.expectOne(`${baseUrl}/mark-all-read`).flush({ markedCount: 2 });
      tick();

      expect(service.unreadCount()).toBe(0);
      expect(service.hasUnread()).toBeFalse();
    }));

    it('should mark all notifications as read in local state', fakeAsync(() => {
      service.markAllAsRead().subscribe();
      httpMock.expectOne(`${baseUrl}/mark-all-read`).flush({ markedCount: 2 });
      tick();

      const notifications = service.notificationList();
      notifications.forEach(n => {
        expect(n.isRead).toBeTrue();
        expect(n.readAt).not.toBeNull();
      });
    }));
  });

  // ============================================================
  // deleteNotification() Tests
  // ============================================================

  describe('deleteNotification()', () => {
    beforeEach(fakeAsync(() => {
      service.loadNotifications().subscribe();
      httpMock.expectOne(r => r.url === baseUrl).flush(mockNotificationListResponse);
      tick();
    }));

    it('should DELETE from correct endpoint', () => {
      service.deleteNotification('notif-1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/notif-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should remove notification from local state', fakeAsync(() => {
      const initialCount = service.notificationList().length;

      service.deleteNotification('notif-1').subscribe();
      httpMock.expectOne(`${baseUrl}/notif-1`).flush(null);
      tick();

      expect(service.notificationList().length).toBe(initialCount - 1);
      expect(service.notificationList().find(n => n.id === 'notif-1')).toBeUndefined();
    }));

    it('should decrement unreadCount when deleting unread notification', fakeAsync(() => {
      const initialUnread = service.unreadCount();

      // notif-1 is unread
      service.deleteNotification('notif-1').subscribe();
      httpMock.expectOne(`${baseUrl}/notif-1`).flush(null);
      tick();

      expect(service.unreadCount()).toBe(initialUnread - 1);
    }));

    it('should not change unreadCount when deleting read notification', fakeAsync(() => {
      const initialUnread = service.unreadCount();

      // notif-2 is read
      service.deleteNotification('notif-2').subscribe();
      httpMock.expectOne(`${baseUrl}/notif-2`).flush(null);
      tick();

      expect(service.unreadCount()).toBe(initialUnread);
    }));
  });

  // ============================================================
  // State Management Tests
  // ============================================================

  describe('State Management', () => {
    describe('clearState()', () => {
      it('should clear all state', fakeAsync(() => {
        // Set up some state
        service.loadNotifications().subscribe();
        httpMock.expectOne(r => r.url === baseUrl).flush(mockNotificationListResponse);
        tick();

        expect(service.notifications()).not.toBeNull();
        expect(service.unreadCount()).toBeGreaterThan(0);

        // Clear it
        service.clearState();

        expect(service.notifications()).toBeNull();
        expect(service.unreadCount()).toBe(0);
        expect(service.error()).toBeNull();
        expect(service.loading()).toBeFalse();
      }));
    });

    describe('clearError()', () => {
      it('should clear only error signal', fakeAsync(() => {
        // First set an error
        service.loadNotifications().subscribe({ error: () => {} });
        httpMock.expectOne(r => r.url === baseUrl).flush({}, { status: 500, statusText: 'Error' });
        tick();
        expect(service.error()).not.toBeNull();

        // Clear it
        service.clearError();
        expect(service.error()).toBeNull();
      }));
    });
  });
});
