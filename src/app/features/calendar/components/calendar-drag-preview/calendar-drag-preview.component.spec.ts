import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarDragPreviewComponent, DragPreviewData } from './calendar-drag-preview.component';
import { AppointmentEvent } from '../../core/calendar.component';

describe('CalendarDragPreviewComponent', () => {
  let component: CalendarDragPreviewComponent;
  let fixture: ComponentFixture<CalendarDragPreviewComponent>;

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
      imports: [CalendarDragPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDragPreviewComponent);
    component = fixture.componentInstance;
    TestBed.runInInjectionContext(() => {
      (component.data as any).set(mockDragPreviewData);
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display appointment title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-title').textContent).toContain('Test Appointment');
  });

  it('should display service name when available', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-service').textContent).toContain('Haircut');
  });

  it('should not display service name when not available', () => {
    const appointmentWithoutService = { ...mockAppointment, serviceName: undefined };
    const dataWithoutService = { ...mockDragPreviewData, appointment: appointmentWithoutService };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(dataWithoutService);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-service')).toBeFalsy();
  });

  it('should display duration correctly', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-duration').textContent).toContain('1h');
  });

  it('should display duration in minutes when less than an hour', () => {
    const appointment30min = { ...mockAppointment, duration: 30 };
    const data30min = { ...mockDragPreviewData, appointment: appointment30min };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(data30min);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-duration').textContent).toContain('30m');
  });

  it('should display duration with hours and minutes when applicable', () => {
    const appointment90min = { ...mockAppointment, duration: 90 };
    const data90min = { ...mockDragPreviewData, appointment: appointment90min };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(data90min);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.drag-preview-duration').textContent).toContain('1h 30m');
  });

  it('should apply correct positioning styles', () => {
    const compiled = fixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    expect(dragPreview.style.left).toBe('200px');
    expect(dragPreview.style.top).toBe('150px');
  });

  it('should apply service CSS class', () => {
    const compiled = fixture.nativeElement;
    const dragPreviewContent = compiled.querySelector('.drag-preview-content');

    expect(dragPreviewContent.classList.contains('service-haircut')).toBe(true);
  });

  it('should handle different positioning', () => {
    const differentData = {
      ...mockDragPreviewData,
      position: {
        left: 400,
        top: 300
      }
    };

    TestBed.runInInjectionContext(() => {
      (component.data as any).set(differentData);
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    expect(dragPreview.style.left).toBe('400px');
    expect(dragPreview.style.top).toBe('300px');
  });

  it('should have correct CSS classes', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.global-drag-preview')).toBeTruthy();
    expect(compiled.querySelector('.drag-preview-content')).toBeTruthy();
    expect(compiled.querySelector('.drag-preview-title')).toBeTruthy();
    expect(compiled.querySelector('.drag-preview-duration')).toBeTruthy();
  });

  it('should be positioned fixed', () => {
    const compiled = fixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    const computedStyle = window.getComputedStyle(dragPreview);
    expect(computedStyle.position).toBe('fixed');
  });

  it('should have pointer events disabled', () => {
    const compiled = fixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    const computedStyle = window.getComputedStyle(dragPreview);
    expect(computedStyle.pointerEvents).toBe('none');
  });

  it('should have high z-index', () => {
    const compiled = fixture.nativeElement;
    const dragPreview = compiled.querySelector('.global-drag-preview');

    const computedStyle = window.getComputedStyle(dragPreview);
    expect(computedStyle.zIndex).toBe('1000');
  });
});
