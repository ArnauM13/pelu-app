import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsListComponent } from './appointments-list.component';
import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../../testing/test-setup';
import { Component, signal } from '@angular/core';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointments-list
      [bookings]="bookings()"
      [hasActiveFilters]="hasActiveFilters()"
      (viewBooking)="onViewBooking($event)"
      (editBooking)="onEditBooking($event)"
      (deleteBooking)="onDeleteBooking($event)"
      (clearFilters)="onClearFilters()"
    >
    </pelu-appointments-list>
  `,
  imports: [AppointmentsListComponent],
})
class TestWrapperComponent {
  bookings = signal([]);
  hasActiveFilters = signal(false);

  onViewBooking(_booking: unknown) {}
  onEditBooking(_booking: unknown) {}
  onDeleteBooking(_booking: unknown) {}
  onClearFilters() {}
}

describe('AppointmentsListComponent', () => {
  let component: AppointmentsListComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(async () => {
    setupDefaultMocks();

    await configureTestBed([TestWrapperComponent]).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.debugElement.children[0].componentInstance;

    resetMocks();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.bookings).toBeDefined();
    expect(component.hasActiveFilters).toBeDefined();
  });

  it('should have output signals', () => {
    expect(component.viewBooking).toBeDefined();
    expect(component.editBooking).toBeDefined();
    expect(component.deleteBooking).toBeDefined();
    expect(component.clearFilters).toBeDefined();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should format time correctly', () => {
    const result = component.formatTime('10:30');
    expect(result).toBe('10:30');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2024-01-15');
    expect(result).toBeDefined();
  });

  it('should identify today correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = component.isToday(today);
    expect(result).toBe(true);
  });

  it('should identify non-today correctly', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const result = component.isToday(yesterdayString);
    expect(result).toBe(false);
  });

  it('should get translated service name', () => {
    const result = component.getTranslatedServiceName('Haircut');
    expect(result).toBeDefined();
  });

  it('should get client name from booking', () => {
    const booking: any = { clientName: 'John Doe', id: '1', email: '', data: '', hora: '', serviceId: '', status: 'confirmed', createdAt: new Date() };
    const result = component.getClientName(booking);
    expect(result).toBe('John Doe');
  });

  it('should return default client name if name is empty', () => {
    const booking: any = { clientName: '', id: '1', email: '', data: '', hora: '', serviceId: '', status: 'confirmed', createdAt: new Date() };
    const result = component.getClientName(booking);
    expect(result).toBe('Client');
  });

  it('should get client name from clientName', () => {
    const booking: any = { clientName: 'Bob Johnson', id: '1', email: '', data: '', hora: '', serviceId: '', status: 'confirmed', createdAt: new Date() };
    const result = component.getClientName(booking);
    expect(result).toBe('Bob Johnson');
  });

  it('should return default client name if no name is available', () => {
    const booking: any = { id: '1', email: '', data: '', hora: '', serviceId: '', status: 'confirmed', createdAt: new Date() };
    const result = component.getClientName(booking);
    expect(result).toBe('Client');
  });
});
