import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetService } from './pet.service';
import { environment } from '../../../environments/environment';
import {
  PetCreateRequest,
  PetUpdateRequest,
  PetResponse,
  PetListResponse,
  PetPhotoResponse
} from '../models/pet.models';

describe('PetService', () => {
  let service: PetService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/pet`;

  const mockPetResponse: PetResponse = {
    id: 'pet-123',
    userId: 'user-456',
    speciesId: 'species-789',
    speciesName: 'Gatto',
    speciesCategory: 'mammifero',
    name: 'Luna',
    sex: 'female',
    birthDate: '2022-03-15',
    calculatedAge: '2 anni',
    profilePhotoUrl: '/photos/luna.jpg',
    photoCount: 3,
    status: 'active',
    isNeutered: false,
    microchip: null,
    color: 'Bianco e nero',
    weight: 4.5,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockPetListResponse: PetListResponse = {
    pets: [
      { id: 'pet-1', name: 'Luna', speciesName: 'Gatto', profilePhotoUrl: null, calculatedAge: '2 anni' },
      { id: 'pet-2', name: 'Max', speciesName: 'Cane', profilePhotoUrl: null, calculatedAge: '3 anni' }
    ],
    totalCount: 2
  };

  const mockPhotoResponse: PetPhotoResponse = {
    id: 'photo-1',
    petId: 'pet-123',
    url: '/photos/photo1.jpg',
    thumbnailUrl: '/photos/thumb1.jpg',
    caption: null,
    isProfilePhoto: false,
    sortOrder: 0,
    uploadedAt: new Date().toISOString()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PetService]
    });

    service = TestBed.inject(PetService);
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
    it('should initialize with null pets signal', () => {
      expect(service.pets()).toBeNull();
    });

    it('should have false loading signal initially', () => {
      expect(service.loading()).toBeFalse();
    });

    it('should have null error signal initially', () => {
      expect(service.error()).toBeNull();
    });

    it('should have null selectedPet signal initially', () => {
      expect(service.selectedPet()).toBeNull();
    });

    it('should compute petCount as 0 when no pets', () => {
      expect(service.petCount()).toBe(0);
    });

    it('should compute hasPets as false when no pets', () => {
      expect(service.hasPets()).toBeFalse();
    });
  });

  // ============================================================
  // loadPets() Tests
  // ============================================================

  describe('loadPets()', () => {
    it('should set loading to true during request', () => {
      service.loadPets().subscribe();
      expect(service.loading()).toBeTrue();

      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
      expect(service.loading()).toBeFalse();
    });

    it('should update pets signal on success', fakeAsync(() => {
      service.loadPets().subscribe();
      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
      tick();

      expect(service.pets()).toEqual(mockPetListResponse);
      expect(service.petCount()).toBe(2);
      expect(service.hasPets()).toBeTrue();
    }));

    it('should set error signal on failure', fakeAsync(() => {
      service.loadPets().subscribe({ error: () => {} });
      httpMock.expectOne(baseUrl).flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Error' }
      );
      tick();

      // Service uses error?.error?.message || 'Failed to load pets'
      // Since we flush with { message: 'Server error' }, that becomes the error
      expect(service.error()).not.toBeNull();
      expect(service.loading()).toBeFalse();
    }));

    it('should clear error before making request', fakeAsync(() => {
      // First set an error
      service.loadPets().subscribe({ error: () => {} });
      httpMock.expectOne(baseUrl).flush({}, { status: 500, statusText: 'Error' });
      tick();
      expect(service.error()).not.toBeNull();

      // Now load again
      service.loadPets().subscribe();
      expect(service.error()).toBeNull(); // Should be cleared

      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    }));
  });

  // ============================================================
  // getPet() Tests
  // ============================================================

  describe('getPet()', () => {
    it('should GET from correct endpoint', () => {
      service.getPet('pet-123').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/pet-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPetResponse);
    });

    it('should update selectedPet signal on success', fakeAsync(() => {
      service.getPet('pet-123').subscribe();
      httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      tick();

      expect(service.selectedPet()).toEqual(mockPetResponse);
    }));

    it('should handle error correctly', fakeAsync(() => {
      service.getPet('invalid-id').subscribe({ error: () => {} });
      httpMock.expectOne(`${baseUrl}/invalid-id`).flush(
        { message: 'Not found' },
        { status: 404, statusText: 'Not Found' }
      );
      tick();

      expect(service.error()).not.toBeNull();
    }));
  });

  // ============================================================
  // createPet() Tests
  // ============================================================

  describe('createPet()', () => {
    const createRequest: PetCreateRequest = {
      speciesId: 'species-789',
      name: 'Buddy',
      sex: 'male',
      birthDate: null,
      estimatedAgeMonths: null,
      origin: null,
      color: 'Marrone',
      weight: null,
      specialMarks: null,
      microchipNumber: null
    };

    it('should POST to correct endpoint', () => {
      service.createPet(createRequest).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockPetResponse);

      // Should trigger loadPets after success
      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    });

    it('should reload pets after successful create', fakeAsync(() => {
      service.createPet(createRequest).subscribe();
      httpMock.expectOne(baseUrl).flush(mockPetResponse);
      tick();

      // Verify loadPets is called
      const listReq = httpMock.expectOne(baseUrl);
      expect(listReq.request.method).toBe('GET');
      listReq.flush(mockPetListResponse);
    }));

    it('should handle validation error', fakeAsync(() => {
      service.createPet(createRequest).subscribe({ error: () => {} });
      httpMock.expectOne(baseUrl).flush(
        { message: 'Invalid species' },
        { status: 400, statusText: 'Bad Request' }
      );
      tick();

      expect(service.error()).not.toBeNull();
    }));
  });

  // ============================================================
  // updatePet() Tests
  // ============================================================

  describe('updatePet()', () => {
    const updateRequest: PetUpdateRequest = {
      name: 'Luna Updated',
      sex: null,
      birthDate: null,
      color: null,
      weight: 5.0,
      specialMarks: null,
      microchipNumber: null,
      isNeutered: true
    };

    it('should PUT to correct endpoint', () => {
      service.updatePet('pet-123', updateRequest).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/pet-123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockPetResponse);

      // Should trigger loadPets after success
      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    });

    it('should update selectedPet signal on success', fakeAsync(() => {
      service.updatePet('pet-123', updateRequest).subscribe();
      httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      tick();

      expect(service.selectedPet()).toEqual(mockPetResponse);

      // Consume loadPets request
      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    }));
  });

  // ============================================================
  // deletePet() Tests
  // ============================================================

  describe('deletePet()', () => {
    it('should DELETE from correct endpoint', () => {
      service.deletePet('pet-123').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/pet-123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      // Should trigger loadPets after success
      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    });

    it('should include reason as query param when provided', () => {
      service.deletePet('pet-123', 'rehomed').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('pet-123'));
      expect(req.request.params.get('reason')).toBe('rehomed');
      req.flush(null);

      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    });

    it('should clear selectedPet if deleted pet was selected', fakeAsync(() => {
      // First select the pet
      service.getPet('pet-123').subscribe();
      httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      tick();
      expect(service.selectedPet()?.id).toBe('pet-123');

      // Now delete it
      service.deletePet('pet-123').subscribe();
      httpMock.expectOne(`${baseUrl}/pet-123`).flush(null);
      tick();

      expect(service.selectedPet()).toBeNull();

      httpMock.expectOne(baseUrl).flush(mockPetListResponse);
    }));
  });

  // ============================================================
  // Photo Operations Tests
  // ============================================================

  describe('Photo Operations', () => {
    describe('getPhotos()', () => {
      it('should GET photos from correct endpoint', () => {
        service.getPhotos('pet-123').subscribe();

        const req = httpMock.expectOne(`${baseUrl}/pet-123/photos`);
        expect(req.request.method).toBe('GET');
        req.flush([mockPhotoResponse]);
      });
    });

    describe('uploadPhoto()', () => {
      it('should POST photo with FormData', () => {
        const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });

        service.uploadPhoto('pet-123', file).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/pet-123/photos`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBeTrue();
        req.flush(mockPhotoResponse);

        // Should refresh pet details
        httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      });

      it('should set isProfilePhoto param when true', () => {
        const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });

        service.uploadPhoto('pet-123', file, true).subscribe();

        const req = httpMock.expectOne(r => r.url.includes('/photos'));
        expect(req.request.params.get('isProfilePhoto')).toBe('true');
        req.flush(mockPhotoResponse);

        httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      });
    });

    describe('deletePhoto()', () => {
      it('should DELETE photo from correct endpoint', () => {
        service.deletePhoto('pet-123', 'photo-1').subscribe();

        const req = httpMock.expectOne(`${baseUrl}/pet-123/photos/photo-1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);

        // Should refresh pet details
        httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      });
    });

    describe('setPrimaryPhoto()', () => {
      it('should PUT to set primary photo', () => {
        service.setPrimaryPhoto('pet-123', 'photo-1').subscribe();

        const req = httpMock.expectOne(`${baseUrl}/pet-123/photos/photo-1/primary`);
        expect(req.request.method).toBe('PUT');
        req.flush(null);

        // Should refresh pet details
        httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
      });
    });
  });

  // ============================================================
  // State Management Tests
  // ============================================================

  describe('State Management', () => {
    describe('clearSelectedPet()', () => {
      it('should set selectedPet to null', fakeAsync(() => {
        // First set a selected pet
        service.getPet('pet-123').subscribe();
        httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
        tick();
        expect(service.selectedPet()).not.toBeNull();

        // Clear it
        service.clearSelectedPet();
        expect(service.selectedPet()).toBeNull();
      }));
    });

    describe('clearState()', () => {
      it('should clear all state signals', fakeAsync(() => {
        // Set up some state
        service.loadPets().subscribe();
        httpMock.expectOne(baseUrl).flush(mockPetListResponse);
        tick();

        service.getPet('pet-123').subscribe();
        httpMock.expectOne(`${baseUrl}/pet-123`).flush(mockPetResponse);
        tick();

        expect(service.pets()).not.toBeNull();
        expect(service.selectedPet()).not.toBeNull();

        // Clear all
        service.clearState();

        expect(service.pets()).toBeNull();
        expect(service.selectedPet()).toBeNull();
        expect(service.error()).toBeNull();
        expect(service.loading()).toBeFalse();
      }));
    });

    describe('clearError()', () => {
      it('should clear only error signal', fakeAsync(() => {
        // First set an error
        service.loadPets().subscribe({ error: () => {} });
        httpMock.expectOne(baseUrl).flush({}, { status: 500, statusText: 'Error' });
        tick();
        expect(service.error()).not.toBeNull();

        // Clear it
        service.clearError();
        expect(service.error()).toBeNull();
      }));
    });
  });
});
