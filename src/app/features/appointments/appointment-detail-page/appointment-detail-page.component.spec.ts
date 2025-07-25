import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { configureTestBed } from '../../../../testing/test-setup';
import { AppointmentDetailPageComponent } from './appointment-detail-page.component';

describe('AppointmentDetailPageComponent', () => {
  let component: AppointmentDetailPageComponent;
  let fixture: ComponentFixture<AppointmentDetailPageComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-id'),
        },
      },
    });
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await configureTestBed(
      [AppointmentDetailPageComponent],
      [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MessageService, useValue: mockMessageService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading signal', () => {
    expect(component.loading).toBeDefined();
  });

  it('should have appointment signal', () => {
    expect(component.appointment).toBeDefined();
  });

  it('should have notFound signal', () => {
    expect(component.notFound).toBeDefined();
  });

  it('should have appointmentInfoItems computed', () => {
    expect(component.appointmentInfoItems).toBeDefined();
  });

  it('should have isToday computed', () => {
    expect(component.isToday).toBeDefined();
  });

  it('should have isPast computed', () => {
    expect(component.isPast).toBeDefined();
  });

  it('should have statusBadge computed', () => {
    expect(component.statusBadge).toBeDefined();
  });

  it('should have deleteAppointment method', () => {
    expect(typeof component.deleteAppointment).toBe('function');
  });

  it('should have startEditing method', () => {
    expect(typeof component.startEditing).toBe('function');
  });

  it('should have goBack method', () => {
    expect(typeof component.goBack).toBe('function');
  });

  it('should have formatDate method', () => {
    expect(typeof component.formatDate).toBe('function');
  });

  it('should have formatTime method', () => {
    expect(typeof component.formatTime).toBe('function');
  });

  it('should have isTodayDate method', () => {
    expect(typeof component.isTodayDate).toBe('function');
  });

  it('should have isPastDate method', () => {
    expect(typeof component.isPastDate).toBe('function');
  });
});
