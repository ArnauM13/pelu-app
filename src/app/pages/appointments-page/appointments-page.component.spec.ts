import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppointmentsPageComponent } from './appointments-page.component';
import { MessageService } from 'primeng/api';

describe('AppointmentsPageComponent', () => {
  let component: AppointmentsPageComponent;
  let fixture: ComponentFixture<AppointmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsPageComponent, FormsModule],
      providers: [MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loadAppointments method', () => {
    expect(typeof component.loadAppointments).toBe('function');
  });

  it('should have deleteAppointment method', () => {
    expect(typeof component.deleteAppointment).toBe('function');
  });

  it('should have saveAppointments method', () => {
    expect(typeof component.saveAppointments).toBe('function');
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

  it('should have clearFilters method', () => {
    expect(typeof component.clearFilters).toBe('function');
  });
});
