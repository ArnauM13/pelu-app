import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../auth/auth.service';
import { mockAuthService } from '../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookingPageComponent,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        MessageService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have updateNom method', () => {
    expect(typeof component.updateNom).toBe('function');
  });

  it('should have updateData method', () => {
    expect(typeof component.updateData).toBe('function');
  });

  it('should have updateHora method', () => {
    expect(typeof component.updateHora).toBe('function');
  });

  it('should have onDateSelected method', () => {
    expect(typeof component.onDateSelected).toBe('function');
  });

  it('should have onBookingConfirmed method', () => {
    expect(typeof component.onBookingConfirmed).toBe('function');
  });

  it('should have onBookingCancelled method', () => {
    expect(typeof component.onBookingCancelled).toBe('function');
  });

  it('should have afegirCita method', () => {
    expect(typeof component.afegirCita).toBe('function');
  });

  it('should have esborrarCita method', () => {
    expect(typeof component.esborrarCita).toBe('function');
  });

  it('should have guardarCites method', () => {
    expect(typeof component.guardarCites).toBe('function');
  });

  it('should have formatDate method', () => {
    expect(typeof component.formatDate).toBe('function');
  });

  it('should have getCitaInfoItem method', () => {
    expect(typeof component.getCitaInfoItem).toBe('function');
  });
});
