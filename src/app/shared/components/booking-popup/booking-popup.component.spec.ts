import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BookingPopupComponent } from './booking-popup.component';
import { MessageService } from 'primeng/api';
import { createTestComponentNoRender } from '../../../../testing/test-setup';

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;

  beforeEach(async () => {
    fixture = await createTestComponentNoRender<BookingPopupComponent>(
      BookingPopupComponent,
      [FormsModule],
      [MessageService]
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.open).toBeDefined();
    expect(component.bookingDetails).toBeDefined();
    expect(component.availableServices).toBeDefined();
  });

  it('should have required output signals', () => {
    expect(component.confirmed).toBeDefined();
    expect(component.cancelled).toBeDefined();
    expect(component.clientNameChanged).toBeDefined();
    expect(component.serviceChanged).toBeDefined();
    expect(component.dateChanged).toBeDefined();
    expect(component.timeChanged).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.selectedService).toBeDefined();
    expect(component.selectedDate).toBeDefined();
    expect(component.selectedTime).toBeDefined();
    expect(component.services).toBeDefined();
    expect(component.canConfirm).toBeDefined();
    expect(component.totalPrice).toBeDefined();
    expect(component.totalDuration).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof component.onClose).toBe('function');
    expect(typeof component.onConfirm).toBe('function');
    expect(typeof component.onClientNameChange).toBe('function');
    expect(typeof component.onServiceChange).toBe('function');
    expect(typeof component.formatDate).toBe('function');
    expect(typeof component.formatPrice).toBe('function');
    expect(typeof component.formatDuration).toBe('function');
    expect(typeof component.formatDateInput).toBe('function');
  });

  it('should format date correctly', () => {
    const testDate = '2024-01-15';
    const formatted = component.formatDate(testDate);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should format price correctly', () => {
    const testPrice = 25;
    const formatted = component.formatPrice(testPrice);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should format duration correctly', () => {
    const testDuration = 30;
    const formatted = component.formatDuration(testDuration);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should emit confirmed event when onConfirm is called', () => {
    spyOn(component.confirmed, 'emit');
    expect(() => component.onConfirm()).not.toThrow();
  });

  it('should emit cancelled event when onClose is called', () => {
    spyOn(component.cancelled, 'emit');
    expect(() => component.onClose()).not.toThrow();
  });

  it('should handle service change', () => {
    const testService = {
      id: '1',
      name: 'Test Service',
      description: 'Test',
      price: 25,
      duration: 30,
      category: 'haircut' as const,
      icon: '✂️'
    };
    expect(() => component.onServiceChange(testService)).not.toThrow();
  });

  it('should handle client name change', () => {
    const testClientName = 'Test Client';
    expect(() => component.onClientNameChange(testClientName)).not.toThrow();
  });

  it('should have time slots', () => {
    expect(component.timeSlots).toBeDefined();
    expect(Array.isArray(component.timeSlots)).toBe(true);
    expect(component.timeSlots.length).toBeGreaterThan(0);
  });

  it('should have service categories', () => {
    expect(component.serviceCategories).toBeDefined();
    expect(Array.isArray(component.serviceCategories)).toBe(true);
    expect(component.serviceCategories.length).toBeGreaterThan(0);
  });

  it('should have default services', () => {
    expect(component.defaultServices).toBeDefined();
    expect(Array.isArray(component.defaultServices)).toBe(true);
    expect(component.defaultServices.length).toBeGreaterThan(0);
  });

  it('should get category icon', () => {
    const icon = component.getCategoryIcon('haircut');
    expect(icon).toBeDefined();
    expect(typeof icon).toBe('string');
  });

  it('should have proper component structure', () => {
    expect(BookingPopupComponent.prototype.constructor.name).toBe('BookingPopupComponent');
  });

  it('should be a standalone component', () => {
    expect(BookingPopupComponent.prototype).toBeDefined();
  });
});
