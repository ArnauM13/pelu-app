import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailPageComponent } from './detail-page.component';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { createTestComponentNoRender } from '../../../../testing/test-setup';
import { mockMessageService } from '../../../../testing/firebase-mocks';

describe('DetailPageComponent', () => {
  let component: DetailPageComponent;
  let fixture: ComponentFixture<DetailPageComponent>;
  let messageService: MessageService;
  let router: Router;

  beforeEach(async () => {
    // Reset mocks before each test
    mockMessageService.add.calls.reset();
    mockMessageService.clear.calls.reset();

    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    fixture = await createTestComponentNoRender<DetailPageComponent>(
      DetailPageComponent,
      [],
      [
        { provide: MessageService, useValue: mockMessageService },
        { provide: Router, useValue: mockRouter }
      ]
    );
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    router = TestBed.inject(Router);

    // Set up default config
    component.config = {
      type: 'appointment',
      loading: false,
      notFound: false,
      infoSections: [],
      actions: []
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input properties', () => {
    expect(component.config).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.back).toBeDefined();
    expect(component.edit).toBeDefined();
    expect(component.save).toBeDefined();
    expect(component.cancelEdit).toBeDefined();
    expect(component.delete).toBeDefined();
    expect(component.updateForm).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onBack).toBe('function');
    expect(typeof component.onEdit).toBe('function');
    expect(typeof component.onSave).toBe('function');
    expect(typeof component.onCancelEdit).toBe('function');
    expect(typeof component.onDelete).toBe('function');
    expect(typeof component.onUpdateForm).toBe('function');
    expect(typeof component.viewAppointmentDetail).toBe('function');
    expect(typeof component.onToastClick).toBe('function');
  });

  it('should have computed properties', () => {
    expect(component.viewTransitionName).toBeDefined();
    expect(component.toastKey).toBeDefined();
  });

    // Toast functionality tests
  describe('Toast Functionality', () => {
    it('should handle toast click with appointment data', () => {
      const mockEvent = {
        data: {
          appointmentId: 'test-123',
          showViewButton: true
        }
      };

      spyOn(component, 'viewAppointmentDetail');

      component.onToastClick(mockEvent);

      expect(component.viewAppointmentDetail).toHaveBeenCalledWith('test-123');
    });

    it('should handle toast click without appointment data', () => {
      const mockEvent = {
        data: {
          appointmentId: 'test-123',
          showViewButton: false
        }
      };

      spyOn(component, 'viewAppointmentDetail');

      component.onToastClick(mockEvent);

      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });

    it('should clear toast when close button is clicked', () => {
      component.config = { type: 'appointment' } as any;
      const toastKey = component.toastKey;
      component.messageService.clear(toastKey);
      expect(mockMessageService.clear).toHaveBeenCalledWith('appointment-detail-toast');
    });

    it('should generate correct toast key based on type', () => {
      component.config = { type: 'appointment' } as any;
      expect(component.toastKey).toBe('appointment-detail-toast');

      component.config = { type: 'profile' } as any;
      expect(component.toastKey).toBe('profile-detail-toast');
    });

    it('should generate correct view transition name based on type', () => {
      component.config = { type: 'appointment' } as any;
      expect(component.viewTransitionName).toBe('appointment-container');

      component.config = { type: 'profile' } as any;
      expect(component.viewTransitionName).toBe('profile-container');
    });
  });

    // Action functionality tests
  describe('Action Functionality', () => {
    it('should emit back event', () => {
      spyOn(component.back, 'emit');

      component.onBack();

      expect(component.back.emit).toHaveBeenCalled();
    });

    it('should emit edit event', () => {
      spyOn(component.edit, 'emit');

      component.onEdit();

      expect(component.edit.emit).toHaveBeenCalled();
    });

        it('should emit save event with form data', () => {
      spyOn(component.save, 'emit');

      const mockFormData = { field: 'value' };
      component.config = { editForm: mockFormData } as any;

      component.onSave();

      expect(component.save.emit).toHaveBeenCalledWith(mockFormData);
    });

    it('should emit cancel edit event', () => {
      spyOn(component.cancelEdit, 'emit');

      component.onCancelEdit();

      expect(component.cancelEdit.emit).toHaveBeenCalled();
    });

    it('should emit delete event', () => {
      spyOn(component.delete, 'emit');

      component.onDelete();

      expect(component.delete.emit).toHaveBeenCalled();
    });

    it('should emit update form event', () => {
      spyOn(component.updateForm, 'emit');

      const field = 'name';
      const value = 'New Name';

      component.onUpdateForm(field, value);

      expect(component.updateForm.emit).toHaveBeenCalledWith({ field, value });
    });
  });

  // Navigation functionality tests
  describe('Navigation Functionality', () => {
    it('should navigate to appointment detail', () => {
      const appointmentId = 'test-123';

      component.viewAppointmentDetail(appointmentId);

      expect(router.navigate).toHaveBeenCalledWith(['/appointments', appointmentId]);
    });

    it('should handle navigation with different appointment IDs', () => {
      const appointmentIds = ['app-1', 'app-2', 'app-3'];

      appointmentIds.forEach(id => {
        component.viewAppointmentDetail(id);
        expect(router.navigate).toHaveBeenCalledWith(['/appointments', id]);
      });
    });
  });

    // Component lifecycle tests
  describe('Component Lifecycle', () => {
    it('should handle config changes', () => {
      const newConfig = {
        type: 'appointment' as const,
        loading: false,
        notFound: false,
        infoSections: [],
        actions: []
      };

      component.config = newConfig;

      expect(component.config).toBe(newConfig);
      expect(component.type).toBe('appointment');
    });

    it('should handle config with appointment data', () => {
      const appointmentConfig = {
        type: 'appointment' as const,
        loading: false,
        notFound: false,
        appointment: { id: 'test-123', nom: 'Test Appointment' },
        infoSections: [],
        actions: []
      };

      component.config = appointmentConfig;

      expect(component.appointment).toBe(appointmentConfig.appointment);
    });

    it('should handle config with profile data', () => {
      const profileConfig = {
        type: 'profile' as const,
        loading: false,
        notFound: false,
        user: { displayName: 'Test User', email: 'test@example.com' },
        infoSections: [],
        actions: []
      };

      component.config = profileConfig;

      expect(component.user).toBe(profileConfig.user);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle toast click with invalid event data', () => {
      const invalidEvent = { data: null };

      spyOn(component, 'viewAppointmentDetail');

      expect(() => component.onToastClick(invalidEvent)).not.toThrow();
      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });

    it('should handle toast click with missing data', () => {
      const invalidEvent = { data: {} };

      spyOn(component, 'viewAppointmentDetail');

      expect(() => component.onToastClick(invalidEvent)).not.toThrow();
      expect(component.viewAppointmentDetail).not.toHaveBeenCalled();
    });

    it('should handle viewAppointmentDetail with null ID', () => {
      // Reset router spy before this test
      (router.navigate as jasmine.Spy).calls.reset();

      expect(() => component.viewAppointmentDetail(null as any)).not.toThrow();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle save with undefined editForm', () => {
      spyOn(component.save, 'emit');

      component.onSave();

      expect(component.save.emit).toHaveBeenCalledWith({});
    });
  });
});
