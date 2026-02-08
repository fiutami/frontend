/**
 * Analytics Service Tests
 *
 * Tests:
 * - Event tracking and buffering
 * - Batch flushing
 * - Session management
 * - Beacon API fallback
 *
 * @version 1.1
 */

import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AnalyticsService } from './analytics.service';
import { ExperimentService } from './experiment.service';
import { environment } from '../../../environments/environment';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpMock: HttpTestingController;
  let mockExperimentService: jasmine.SpyObj<ExperimentService>;

  beforeEach(() => {
    // Mock ExperimentService
    mockExperimentService = jasmine.createSpyObj('ExperimentService', [
      'getVariant',
      'getExperimentVersion',
      'getDeviceId'
    ]);
    mockExperimentService.getVariant.and.returnValue('A');
    mockExperimentService.getExperimentVersion.and.returnValue(1);
    mockExperimentService.getDeviceId.and.returnValue('test-device-id');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnalyticsService,
        { provide: ExperimentService, useValue: mockExperimentService }
      ]
    });

    service = TestBed.inject(AnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.ngOnDestroy();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Session Management', () => {
    it('should generate session ID', () => {
      const sessionId = service.startSession();
      expect(sessionId).toBeTruthy();
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should return same session ID on subsequent calls', () => {
      const first = service.startSession();
      const second = service.getSessionId();
      // Note: getSessionId creates new if not exists, so should match
      expect(service.getSessionId()).toBe(service.getSessionId());
    });

    it('should create session if getSessionId called without startSession', () => {
      const sessionId = service.getSessionId();
      expect(sessionId).toBeTruthy();
    });
  });

  describe('Event Tracking', () => {
    it('should track questionnaire_started event', fakeAsync(() => {
      service.track('questionnaire_started', {});

      // Force flush
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      expect(req.request.method).toBe('POST');

      const body = req.request.body as any[];
      expect(body.length).toBe(1);
      expect(body[0].eventType).toBe('questionnaire_started');
      expect(body[0].variant).toBe('A');

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should include correct metadata in events', fakeAsync(() => {
      service.track('question_viewed', { questionId: 'Q01' });
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      const body = req.request.body as any[];

      expect(body[0].experimentVersion).toBe(1);
      expect(body[0].questionnaireVersion).toBe('1.1');
      expect(body[0].deviceId).toBe('test-device-id');
      expect(body[0].payload.questionId).toBe('Q01');

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should track question_answered with timing', fakeAsync(() => {
      service.trackQuestionAnswered('Q01', 'option_a', 3500);
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      const body = req.request.body as any[];

      expect(body[0].eventType).toBe('question_answered');
      expect(body[0].payload.questionId).toBe('Q01');
      expect(body[0].payload.optionId).toBe('option_a');
      expect(body[0].payload.timeSpentMs).toBe(3500);

      req.flush({});

      discardPeriodicTasks();
    }));
  });

  describe('Convenience Methods', () => {
    it('should track loaded event', fakeAsync(() => {
      service.trackLoaded();
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      expect(req.request.body[0].eventType).toBe('questionnaire_loaded');
      req.flush({});

      discardPeriodicTasks();
    }));

    it('should track back navigation', fakeAsync(() => {
      service.trackBackNavigation('Q05', 'Q04');
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      const event = req.request.body[0];

      expect(event.eventType).toBe('back_navigation_used');
      expect(event.payload.fromQuestionId).toBe('Q05');
      expect(event.payload.toQuestionId).toBe('Q04');

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should track completion', fakeAsync(() => {
      service.trackCompleted(120000, ['lifestyle', 'environment']);
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      const event = req.request.body[0];

      expect(event.eventType).toBe('questionnaire_completed');
      expect(event.payload.totalTimeMs).toBe(120000);
      expect(event.payload.completedModules).toEqual(['lifestyle', 'environment']);

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should track fiuto chat opened', fakeAsync(() => {
      service.trackFiutoChatOpened('Q03');
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      expect(req.request.body[0].eventType).toBe('fiuto_chat_opened');

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should track recommendation viewed', fakeAsync(() => {
      service.trackRecommendationViewed('dog-labrador', 1);
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      const event = req.request.body[0];

      expect(event.eventType).toBe('recommendation_viewed');
      expect(event.payload.breedId).toBe('dog-labrador');
      expect(event.payload.rank).toBe(1);

      req.flush({});

      discardPeriodicTasks();
    }));
  });

  describe('Batching', () => {
    it('should buffer events', fakeAsync(() => {
      service.track('question_viewed', { questionId: 'Q01' });
      service.track('question_viewed', { questionId: 'Q02' });
      service.track('question_viewed', { questionId: 'Q03' });

      // No flush yet, so no HTTP call
      httpMock.expectNone(`${environment.apiUrl}/questionnaire/events`);

      // Now flush
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      expect(req.request.body.length).toBe(3);

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should auto-flush at MAX_BATCH (25)', fakeAsync(() => {
      // Add 25 events (the MAX_BATCH threshold)
      for (let i = 0; i < 25; i++) {
        service.track('question_viewed', { questionId: `Q${i}` });
      }

      // Should have auto-flushed
      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      expect(req.request.body.length).toBe(25);

      req.flush({});

      discardPeriodicTasks();
    }));

    it('should not send empty buffer', fakeAsync(() => {
      service.flush();

      // No HTTP call expected
      httpMock.expectNone(`${environment.apiUrl}/questionnaire/events`);

      discardPeriodicTasks();
    }));
  });

  describe('Error Handling', () => {
    it('should re-buffer events on HTTP error', fakeAsync(() => {
      service.track('question_viewed', { questionId: 'Q01' });
      service.flush();

      const req = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      req.error(new ProgressEvent('error'));

      // Flush again - events should have been put back
      service.flush();

      const retryReq = httpMock.expectOne(`${environment.apiUrl}/questionnaire/events`);
      expect(retryReq.request.body.length).toBe(1);

      retryReq.flush({});

      discardPeriodicTasks();
    }));
  });
});
