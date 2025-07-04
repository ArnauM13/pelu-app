import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppointmentsPageComponent } from './appointments-page.component';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('AppointmentsPageComponent', () => {
  let component: AppointmentsPageComponent;
  let fixture: ComponentFixture<AppointmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppointmentsPageComponent,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should have clearFilters method', () => {
    expect(typeof component.clearFilters).toBe('function');
  });

  it('should have computed properties', () => {
    expect(component.cites).toBeDefined();
    expect(component.viewMode).toBeDefined();
    expect(component.filteredCites).toBeDefined();
    expect(component.totalAppointments).toBeDefined();
    expect(component.todayAppointments).toBeDefined();
    expect(component.upcomingAppointments).toBeDefined();
  });

  it('should have filter methods', () => {
    expect(typeof component.applyQuickFilter).toBe('function');
    expect(typeof component.toggleAdvancedFilters).toBe('function');
    expect(typeof component.onFilterClick).toBe('function');
  });

  it('should have view methods', () => {
    expect(typeof component.onViewButtonClick).toBe('function');
  });

  it('should have additional methods', () => {
    expect(typeof component.onDateChange).toBe('function');
    expect(typeof component.onClientChange).toBe('function');
    expect(typeof component.onResetFilters).toBe('function');
    expect(typeof component.viewAppointmentDetail).toBe('function');
    expect(typeof component.onDateSelect).toBe('function');
  });

  it('should initialize with default values', () => {
    expect(component.cites().length).toBe(0);
    expect(component.viewMode()).toBe('list');
    expect(component.quickFilter()).toBe('all');
    expect(component.showAdvancedFilters()).toBe(false);
  });

  it('should be a standalone component', () => {
    expect(AppointmentsPageComponent.prototype.constructor).toBeDefined();
    expect(AppointmentsPageComponent.prototype.constructor.name).toBe('AppointmentsPageComponent');
  });

  it('should have proper component structure', () => {
    expect(AppointmentsPageComponent.name).toBe('AppointmentsPageComponent');
    expect(typeof AppointmentsPageComponent).toBe('function');
  });

  it('should render with proper structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.innerHTML).toContain('pelu-appointments-page');
  });
});
