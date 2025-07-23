import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CalendarDragPreviewComponent, DragPreviewData } from './calendar-drag-preview.component';
import { AppointmentEvent } from '../../core/calendar.component';

// Test host component to provide required inputs
@Component({
    template: `
    <pelu-calendar-drag-preview [data]="testData"></pelu-calendar-drag-preview>
  `,
    imports: [CalendarDragPreviewComponent]
})
class TestHostComponent {
  testData: DragPreviewData = {
    appointment: {
      id: '1',
      title: 'Test Appointment',
      start: '2024-01-15T10:00:00',
      duration: 60,
      serviceName: 'Haircut',
      clientName: 'John Doe',
      isPublicBooking: false,
      isOwnBooking: true,
      canDrag: true,
      canViewDetails: true
    },
    position: {
      left: 200,
      top: 150
    },
    serviceCssClass: 'service-haircut'
  };
}

describe('CalendarDragPreviewComponent', () => {
  let component: CalendarDragPreviewComponent;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  const mockAppointment: AppointmentEvent = {
    id: '1',
    title: 'Test Appointment',
    start: '2024-01-15T10:00:00',
    duration: 60,
    serviceName: 'Haircut',
    clientName: 'John Doe',
    isPublicBooking: false,
    isOwnBooking: true,
    canDrag: true,
    canViewDetails: true
  };

  const mockDragPreviewData: DragPreviewData = {
    appointment: mockAppointment,
    position: {
      left: 200,
      top: 150
    },
    serviceCssClass: 'service-haircut'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
    .compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    component = hostFixture.debugElement.children[0].componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data input signal', () => {
    expect(component.data).toBeDefined();
    expect(typeof component.data).toBe('function');
  });

  it('should display appointment title', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-title').textContent).toContain('Test Appointment');
  });

  it('should display service name when available', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-service').textContent).toContain('Haircut');
  });

  it('should not display service name when not available', () => {
    const appointmentWithoutService = { ...mockAppointment, serviceName: undefined };
    hostComponent.testData = { ...mockDragPreviewData, appointment: appointmentWithoutService };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-service')).toBeFalsy();
  });

  it('should display duration correctly', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-duration').textContent).toContain('1h');
  });

  it('should display duration in minutes when less than an hour', () => {
    const appointment30min = { ...mockAppointment, duration: 30 };
    hostComponent.testData = { ...mockDragPreviewData, appointment: appointment30min };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-duration').textContent).toContain('30m');
  });

  it('should display duration with hours and minutes when applicable', () => {
    const appointment90min = { ...mockAppointment, duration: 90 };
    hostComponent.testData = { ...mockDragPreviewData, appointment: appointment90min };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-duration').textContent).toContain('1h 30m');
  });

  it('should apply correct positioning styles', () => {
    const compiled = hostFixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    expect(dragPreview.style.left).toBe('200px');
    expect(dragPreview.style.top).toBe('150px');
  });

  it('should apply service CSS class', () => {
    const compiled = hostFixture.nativeElement;
    const dragPreviewContent = compiled.querySelector('.drag-preview-content');

    expect(dragPreviewContent.classList.contains('service-haircut')).toBe(true);
  });

  it('should handle different positioning', () => {
    hostComponent.testData = {
      ...mockDragPreviewData,
      position: {
        left: 400,
        top: 300
      }
    };
    hostFixture.detectChanges();

    const compiled = hostFixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    expect(dragPreview.style.left).toBe('400px');
    expect(dragPreview.style.top).toBe('300px');
  });

  it('should have correct CSS classes', () => {
    const compiled = hostFixture.nativeElement;
    expect(compiled.querySelector('.global-drag-preview')).toBeTruthy();
    expect(compiled.querySelector('.drag-preview-content')).toBeTruthy();
    expect(compiled.querySelector('.drag-preview-title')).toBeTruthy();
    expect(compiled.querySelector('.drag-preview-duration')).toBeTruthy();
  });

  it('should be positioned fixed', () => {
    const compiled = hostFixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    const computedStyle = window.getComputedStyle(dragPreview);
    expect(computedStyle.position).toBe('fixed');
  });

  it('should have pointer events disabled', () => {
    const compiled = hostFixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    const computedStyle = window.getComputedStyle(dragPreview);
    expect(computedStyle.pointerEvents).toBe('none');
  });

  it('should have high z-index', () => {
    const compiled = hostFixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    const computedStyle = window.getComputedStyle(dragPreview);
    expect(computedStyle.zIndex).toBe('1000');
  });
});
