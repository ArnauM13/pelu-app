import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentDetailPopupComponent } from './appointment-detail-popup.component';
import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../testing/test-setup';
import { ConfirmationService } from 'primeng/api';

describe('AppointmentDetailPopupComponent', () => {
  let component: AppointmentDetailPopupComponent;
  let fixture: ComponentFixture<AppointmentDetailPopupComponent>;

  const _mockAppointment = {
    id: '1',
    clientName: 'John Doe',
    email: 'john@example.com',
    data: '2024-01-15',
    hora: '10:00',
    notes: 'Test appointment',
    serviceId: 'service1',
    status: 'confirmed' as const,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    setupDefaultMocks();

    await configureTestBed([AppointmentDetailPopupComponent], [
      ConfirmationService
    ]).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailPopupComponent);
    component = fixture.componentInstance;

    resetMocks();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.open).toBeDefined();
    expect(component.booking).toBeDefined();
    expect(component.bookingId).toBeDefined();
    expect(component.hideViewDetailButton).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.closed).toBeDefined();
    expect(component.deleted).toBeDefined();
    expect(component.editRequested).toBeDefined();
    expect(component.viewDetailRequested).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.currentBooking).toBeDefined();
    expect(component.isOpen).toBeDefined();
    expect(component.serviceName).toBeDefined();
    expect(component.serviceDuration).toBeDefined();
    expect(component.servicePrice).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onClose).toBe('function');
    expect(typeof component.onEdit).toBe('function');
    expect(typeof component.onDelete).toBe('function');
    expect(typeof component.onViewDetail).toBe('function');
  });

  it('should emit closed event when onClose is called', () => {
    spyOn(component.closed, 'emit');
    component.onClose();
    expect(component.closed.emit).toHaveBeenCalled();
  });


});
