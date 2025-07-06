import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';

import { BookingPopupComponent } from './booking-popup.component';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'COMMON.BOOKING_CONFIRMATION': 'Confirmar Reserva',
      'COMMON.DATE': 'Data',
      'COMMON.TIME': 'Hora',
      'COMMON.SERVICE': 'Servei',
      'COMMON.SELECT_SERVICE': 'Selecciona un servei',
      'COMMON.CLIENT_NAME': 'Nom del client',
      'COMMON.ENTER_CLIENT_NAME': 'Introdueix el nom del client',
      'COMMON.DURATION': 'Durada',
      'COMMON.PRICE': 'Preu',
      'COMMON.CANCEL': 'Cancel·lar',
      'COMMON.CONFIRM_BOOKING': 'Confirmar Reserva',
      'COMMON.MISSING_FIELDS': 'Falten camps obligatoris'
    });
  }
}

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookingPopupComponent,
        FormsModule,
        ButtonModule,
        CardModule,
        DropdownModule,
        ToastModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the booking confirmation title', () => {
    const titleElement = fixture.nativeElement.querySelector('h3');
    expect(titleElement.textContent).toContain('Confirmar Reserva');
  });

  it('should display date and time in readonly mode', () => {
    const readonlyFields = fixture.nativeElement.querySelectorAll('.readonly-field');
    expect(readonlyFields.length).toBeGreaterThan(0);
  });

  it('should display service selection dropdown', () => {
    const serviceDropdown = fixture.nativeElement.querySelector('p-dropdown');
    expect(serviceDropdown).toBeTruthy();
  });

  it('should have service options', () => {
    expect(component.services.length).toBeGreaterThan(0);
  });

  it('should display client name input', () => {
    const clientNameInput = fixture.nativeElement.querySelector('input[placeholder*="Introdueix"]');
    expect(clientNameInput).toBeTruthy();
  });

  it('should have confirm and cancel buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have onServiceChange method', () => {
    expect(component.onServiceChange).toBeDefined();
  });

  it('should have onConfirm method', () => {
    expect(component.onConfirm).toBeDefined();
  });

  it('should have onClose method', () => {
    expect(component.onClose).toBeDefined();
  });

  it('should have formatDateInput method', () => {
    expect(component.formatDateInput).toBeDefined();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-01-15');
    const formattedDate = component.formatDateInput(testDate);
    expect(formattedDate).toBe('15/01/2024');
  });

  it('should have services with correct categories', () => {
    const serviceCategories = ['haircut', 'beard', 'treatment', 'styling'];
    const services = component.services();

    serviceCategories.forEach(category => {
      const servicesInCategory = services.filter((s: any) => s.category === category);
      expect(servicesInCategory.length).toBeGreaterThan(0);
    });
  });

  it('should have proper component structure', () => {
    expect(component.bookingDetails).toBeDefined();
    expect(component.selectedService).toBeDefined();
    expect(component.selectedDate).toBeDefined();
    expect(component.selectedTime).toBeDefined();
  });

  it('should have proper event emitters', () => {
    expect(component.confirmed).toBeDefined();
    expect(component.serviceChanged).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.canConfirm).toBeDefined();
  });

  it('should handle service change without errors', () => {
    const services = component.services();
    if (services.length > 0) {
      expect(() => {
        component.onServiceChange(services[0]);
      }).not.toThrow();
    }
  });

  it('should handle confirm without errors', () => {
    expect(() => {
      component.onConfirm();
    }).not.toThrow();
  });

  it('should handle close without errors', () => {
    expect(() => {
      component.onClose();
    }).not.toThrow();
  });
});
