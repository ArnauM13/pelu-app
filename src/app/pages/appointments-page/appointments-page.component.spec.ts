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

  it('should have popup methods', () => {
    expect(typeof component.openFiltersPopup).toBe('function');
    expect(typeof component.closePopup).toBe('function');
  });
});
