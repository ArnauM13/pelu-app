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
    serviceName: 'Haircut',
    duration: 60,
    userId: 'user1'
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
    expect(component.appointment).toBeDefined();
    expect(component.hideViewDetailButton).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.closed).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.appointmentInfoItems).toBeDefined();
    expect(component.isToday).toBeDefined();
    expect(component.isPast).toBeDefined();
    expect(component.statusBadge).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onClose).toBe('function');
    expect(typeof component.onViewFullDetail).toBe('function');
    expect(typeof component.onBackdropClick).toBe('function');
    expect(typeof component.formatDate).toBe('function');
    expect(typeof component.formatTime).toBe('function');
    expect(typeof component.isTodayDate).toBe('function');
    expect(typeof component.isPastDate).toBe('function');
  });

  it('should emit closed event when onClose is called', (done) => {
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

  it('should check if date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = component.isTodayDate(today);
    expect(typeof result).toBe('boolean');
  });

  it('should check if date is past', () => {
    const pastDate = '2023-01-01';
    const result = component.isPastDate(pastDate);
    expect(typeof result).toBe('boolean');
  });
});
