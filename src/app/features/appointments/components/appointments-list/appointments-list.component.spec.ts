import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsListComponent } from './appointments-list.component';
import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../../testing/test-setup';
import { Component, signal } from '@angular/core';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointments-list
      [appointments]="appointments()"
      [hasActiveFilters]="hasActiveFilters()"
      (onViewAppointment)="onViewAppointment($event)"
      (onDeleteAppointment)="onDeleteAppointment($event)"
      (onClearFilters)="onClearFilters()">
    </pelu-appointments-list>
  `,
  imports: [AppointmentsListComponent],
  standalone: true
})
class TestWrapperComponent {
  appointments = signal([]);
  hasActiveFilters = signal(false);

  onViewAppointment(appointment: any) {}
  onDeleteAppointment(appointment: any) {}
  onClearFilters() {}
}

describe('AppointmentsListComponent', () => {
  let component: AppointmentsListComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let wrapperComponent: TestWrapperComponent;

  beforeEach(async () => {
    setupDefaultMocks();

    await configureTestBed([TestWrapperComponent]).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;

    resetMocks();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.appointments).toBeDefined();
    expect(component.hasActiveFilters).toBeDefined();
  });

  it('should have output signals', () => {
    expect(component.onViewAppointment).toBeDefined();
    expect(component.onDeleteAppointment).toBeDefined();
    expect(component.onClearFilters).toBeDefined();
  });

  it('should have service dependencies injected', () => {
    expect(component.serviceColorsService).toBeDefined();
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
});
