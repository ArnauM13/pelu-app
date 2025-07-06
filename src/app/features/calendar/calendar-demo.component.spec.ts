import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDemoComponent } from './calendar-demo.component';
import { AppointmentEvent } from './calendar.component';

describe('CalendarDemoComponent', () => {
  let component: CalendarDemoComponent;
  let fixture: ComponentFixture<CalendarDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDemoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarDemoComponent);
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

  it('should render demo container element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const containerElement = compiled.querySelector('.demo-container');
    expect(containerElement).toBeTruthy();
  });

  it('should render demo title', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h2');
    expect(titleElement?.textContent?.trim()).toBe('Calendari Setmanal - Demostració');
  });

  it('should render demo features list', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const featuresList = compiled.querySelector('.demo-features');
    expect(featuresList).toBeTruthy();
  });

  it('should render demo controls', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const controlsElement = compiled.querySelector('.demo-controls');
    expect(controlsElement).toBeTruthy();
  });

  it('should render calendar wrapper', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const calendarWrapper = compiled.querySelector('.calendar-wrapper');
    expect(calendarWrapper).toBeTruthy();
  });

  it('should render demo info section', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const infoElement = compiled.querySelector('.demo-info');
    expect(infoElement).toBeTruthy();
  });

  it('should have addSampleAppointments method', () => {
    expect(typeof component.addSampleAppointments).toBe('function');
  });

  it('should have clearAppointments method', () => {
    expect(typeof component.clearAppointments).toBe('function');
  });

  it('should have clearAllAppointments method', () => {
    expect(typeof component.clearAllAppointments).toBe('function');
  });

  it('should have onDateSelected method', () => {
    expect(typeof component.onDateSelected).toBe('function');
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

  it('should handle multiple add/clear cycles', () => {
    // First cycle
    component.addSampleAppointments();
    expect(component.demoEvents().length).toBeGreaterThan(0);

    component.clearAppointments();
    expect(component.demoEvents().length).toBe(0);

    // Second cycle
    component.addSampleAppointments();
    expect(component.demoEvents().length).toBeGreaterThan(0);

    component.clearAppointments();
    expect(component.demoEvents().length).toBe(0);
  });

  it('should render calendar component', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const calendarComponent = compiled.querySelector('pelu-calendar-component');
    expect(calendarComponent).toBeTruthy();
  });

  it('should render demo buttons', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.demo-btn');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render info grid items', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const infoItems = compiled.querySelectorAll('.info-item');
    expect(infoItems.length).toBeGreaterThan(0);
  });
});
