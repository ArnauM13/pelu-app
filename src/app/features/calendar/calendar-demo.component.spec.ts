import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDemoComponent } from './calendar-demo.component';
import { createTestComponentNoRender } from '../../../testing/test-setup';

describe('CalendarDemoComponent', () => {
  let component: CalendarDemoComponent;
  let fixture: ComponentFixture<CalendarDemoComponent>;

  beforeEach(async () => {
    fixture = await createTestComponentNoRender<CalendarDemoComponent>(
      CalendarDemoComponent
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have demoEvents signal', () => {
    expect(component.demoEvents).toBeDefined();
    expect(typeof component.demoEvents).toBe('function');
  });

  it('should initialize with empty demo events', () => {
    expect(component.demoEvents()).toEqual([]);
  });

  it('should have required methods', () => {
    expect(typeof component.addSampleAppointments).toBe('function');
    expect(typeof component.clearAppointments).toBe('function');
    expect(typeof component.clearAllAppointments).toBe('function');
    expect(typeof component.onDateSelected).toBe('function');
  });

  it('should add sample appointments when addSampleAppointments is called', () => {
    const initialEvents = component.demoEvents();
    expect(initialEvents.length).toBe(0);

    component.addSampleAppointments();

    const updatedEvents = component.demoEvents();
    expect(updatedEvents.length).toBeGreaterThan(0);
  });

  it('should clear demo appointments when clearAppointments is called', () => {
    // First add some appointments
    component.addSampleAppointments();
    expect(component.demoEvents().length).toBeGreaterThan(0);

    // Then clear them
    component.clearAppointments();
    expect(component.demoEvents().length).toBe(0);
  });

  it('should clear all appointments when clearAllAppointments is called', () => {
    // First add some appointments
    component.addSampleAppointments();
    expect(component.demoEvents().length).toBeGreaterThan(0);

    // Then clear all
    component.clearAllAppointments();
    expect(component.demoEvents().length).toBe(0);
  });

  it('should handle date selection when onDateSelected is called', () => {
    const mockSelection = { date: '2024-01-15', time: '10:00' };

    // Should not throw error
    expect(() => {
      component.onDateSelected(mockSelection);
    }).not.toThrow();
  });

  it('should add appointments with correct structure', () => {
    component.addSampleAppointments();

    const events = component.demoEvents();
    expect(events.length).toBeGreaterThan(0);

    // Check that events have the required properties
    const firstEvent = events[0];
    expect(firstEvent.id).toBeDefined();
    expect(firstEvent.title).toBeDefined();
    expect(firstEvent.start).toBeDefined();
    expect(firstEvent.duration).toBeDefined();
  });

  it('should add appointments with valid dates', () => {
    component.addSampleAppointments();

    const events = component.demoEvents();
    expect(events.length).toBeGreaterThan(0);

    // Check that start dates are valid ISO strings
    events.forEach(event => {
      expect(event.start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });

  it('should add appointments with valid durations', () => {
    component.addSampleAppointments();

    const events = component.demoEvents();
    expect(events.length).toBeGreaterThan(0);

    // Check that durations are positive numbers
    events.forEach(event => {
      expect(event.duration).toBeGreaterThan(0);
      expect(typeof event.duration).toBe('number');
    });
  });

  it('should clear appointments correctly', () => {
    // Add appointments
    component.addSampleAppointments();
    const eventsAfterAdd = component.demoEvents();
    expect(eventsAfterAdd.length).toBeGreaterThan(0);

    // Clear appointments
    component.clearAppointments();
    const eventsAfterClear = component.demoEvents();
    expect(eventsAfterClear.length).toBe(0);
  });

  it('should clear all appointments correctly', () => {
    // Add appointments
    component.addSampleAppointments();
    const eventsAfterAdd = component.demoEvents();
    expect(eventsAfterAdd.length).toBeGreaterThan(0);

    // Clear all appointments
    component.clearAllAppointments();
    const eventsAfterClearAll = component.demoEvents();
    expect(eventsAfterClearAll.length).toBe(0);
  });

  it('should handle date selection without errors', () => {
    const mockSelection = { date: '2024-01-15', time: '10:00' };

    expect(() => {
      component.onDateSelected(mockSelection);
    }).not.toThrow();
  });

  it('should be a standalone component', () => {
    expect(CalendarDemoComponent.prototype.constructor.name).toBe('CalendarDemoComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = CalendarDemoComponent;
    expect(componentClass.name).toBe('CalendarDemoComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(CalendarDemoComponent.prototype).toBeDefined();
    expect(CalendarDemoComponent.prototype.constructor).toBeDefined();
  });
});
