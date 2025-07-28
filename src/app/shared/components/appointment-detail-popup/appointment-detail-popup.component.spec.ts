import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentDetailPopupComponent } from './appointment-detail-popup.component';
import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../testing/test-setup';

describe('AppointmentDetailPopupComponent', () => {
  let component: AppointmentDetailPopupComponent;
  let fixture: ComponentFixture<AppointmentDetailPopupComponent>;

  const mockAppointment = {
    id: '1',
    nom: 'John Doe',
    data: '2024-01-15',
    hora: '10:00',
    servei: 'Corte de pelo',
    serviceName: 'SERVICES.NAMES.MALE_HAIRCUT',
    duration: 60,
    userId: 'user1',
  };

  beforeEach(async () => {
    setupDefaultMocks();

    await configureTestBed([AppointmentDetailPopupComponent]).compileComponents();

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
  });

  it('should have computed properties', () => {
    expect(component.currentBooking).toBeDefined();
    expect(component.isOpen).toBeDefined();
    expect(component.canEdit).toBeDefined();
    expect(component.canDelete).toBeDefined();
    expect(component.isFuture).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onClose).toBe('function');
    expect(typeof component.onEdit).toBe('function');
    expect(typeof component.onDelete).toBe('function');
    expect(typeof component.onViewDetail).toBe('function');
    expect(typeof component.formatDate).toBe('function');
    expect(typeof component.formatTime).toBe('function');
  });

  it('should emit closed event when onClose is called', done => {
    spyOn(component.closed, 'emit');
    component.onClose();

    // Wait for the setTimeout to complete
    setTimeout(() => {
      expect(component.closed.emit).toHaveBeenCalled();
      done();
    }, 350); // Slightly longer than the 300ms timeout in the component
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2024-01-15');
    expect(result).toBeDefined();
  });

  it('should format time correctly', () => {
    const result = component.formatTime('10:30');
    expect(result).toBe('10:30');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2024-01-15');
    expect(result).toBeDefined();
  });

  it('should format time correctly', () => {
    const result = component.formatTime('10:30');
    expect(result).toBe('10:30');
  });
});
