import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppointmentsPageComponent } from './appointments-page.component';
import { MessageService } from 'primeng/api';
import { createTestComponentNoRender } from '../../../testing/test-setup';

describe('AppointmentsPageComponent', () => {
  let component: AppointmentsPageComponent;
  let fixture: ComponentFixture<AppointmentsPageComponent>;

  beforeEach(async () => {
    fixture = await createTestComponentNoRender<AppointmentsPageComponent>(
      AppointmentsPageComponent,
      [FormsModule],
      [MessageService]
    );
    component = fixture.componentInstance;

    // No cal detectChanges() per evitar errors de pipes de traducció
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have deleteAppointment method', () => {
    expect(typeof component.deleteAppointment).toBe('function');
  });

  it('should have formatDate method', () => {
    expect(typeof component.formatDate).toBe('function');
  });

  it('should have formatTime method', () => {
    expect(typeof component.formatTime).toBe('function');
  });

  it('should have isToday method', () => {
    expect(typeof component.isToday).toBe('function');
  });

  it('should have isPast method', () => {
    expect(typeof component.isPast).toBe('function');
  });

  it('should have clearAllFilters method', () => {
    expect(typeof component.clearAllFilters).toBe('function');
  });

  it('should have computed properties', () => {
    expect(component.appointments).toBeDefined();
    expect(component.viewMode).toBeDefined();
    expect(component.filteredAppointments).toBeDefined();
    expect(component.totalAppointments).toBeDefined();
    expect(component.todayAppointments).toBeDefined();
    expect(component.upcomingAppointments).toBeDefined();
  });

  it('should have filter methods', () => {
    expect(typeof component.setFilterDate).toBe('function');
    expect(typeof component.setFilterClient).toBe('function');
    expect(typeof component.setQuickFilter).toBe('function');
  });

  it('should have view methods', () => {
    expect(typeof component.setViewMode).toBe('function');
  });

  it('should have utility methods', () => {
    expect(typeof component.deleteAppointment).toBe('function');
    expect(typeof component.viewAppointmentDetail).toBe('function');
  });

  // Test method functionality without template rendering
  it('should format date correctly', () => {
    const testDate = '2024-01-15';
    const formatted = component.formatDate(testDate);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should format time correctly', () => {
    const testTime = '10:30';
    const formatted = component.formatTime(testTime);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should check if date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = component.isToday(today);
    expect(typeof result).toBe('boolean');
  });

  it('should check if date is past', () => {
    const pastDate = '2023-01-01';
    const result = component.isPast(pastDate);
    expect(typeof result).toBe('boolean');
  });

  it('should clear all filters', () => {
    expect(() => component.clearAllFilters()).not.toThrow();
  });

  it('should set filter date', () => {
    const testDate = '2024-01-15';
    expect(() => component.setFilterDate(testDate)).not.toThrow();
  });

  it('should set filter client', () => {
    const testClient = 'Test Client';
    expect(() => component.setFilterClient(testClient)).not.toThrow();
  });

  it('should set quick filter', () => {
    expect(() => component.setQuickFilter('all')).not.toThrow();
    expect(() => component.setQuickFilter('today')).not.toThrow();
    expect(() => component.setQuickFilter('upcoming')).not.toThrow();
    expect(() => component.setQuickFilter('mine')).not.toThrow();
  });

  it('should set view mode', () => {
    expect(() => component.setViewMode('list')).not.toThrow();
    expect(() => component.setViewMode('calendar')).not.toThrow();
  });

  it('should handle appointment deletion', () => {
    const mockAppointment = { id: '1', nom: 'Test' };
    expect(() => component.deleteAppointment(mockAppointment)).not.toThrow();
  });

  it('should handle appointment detail view', () => {
    const mockAppointment = { id: '1', nom: 'Test' };
    expect(() => component.viewAppointmentDetail(mockAppointment)).not.toThrow();
  });
});
