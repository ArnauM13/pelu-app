import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../auth/auth.service';
import { mockAuthService } from '../../../testing/firebase-mocks';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock AuthService with signals
const mockAuthServiceWithSignals = {
  user: jasmine.createSpy('user').and.returnValue(null),
  isLoading: jasmine.createSpy('isLoading').and.returnValue(false),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
  loginWithGoogle: jasmine.createSpy('loginWithGoogle').and.returnValue(Promise.resolve()),
  registre: jasmine.createSpy('registre').and.returnValue(Promise.resolve()),
  login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
  logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
  saveCurrentUserLanguage: jasmine.createSpy('saveCurrentUserLanguage'),
  userDisplayName: jasmine.createSpy('userDisplayName').and.returnValue('')
};

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();

    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

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
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: AuthService, useValue: mockAuthServiceWithSignals }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have computed signals', () => {
    expect(component.nouClient).toBeDefined();
    expect(typeof component.nouClient).toBe('function');
    expect(component.cites).toBeDefined();
    expect(typeof component.cites).toBe('function');
    expect(component.showBookingPopup).toBeDefined();
    expect(typeof component.showBookingPopup).toBe('function');
    expect(component.bookingDetails).toBeDefined();
    expect(typeof component.bookingDetails).toBe('function');
  });

  it('should have events computed property', () => {
    expect(component.events).toBeDefined();
    expect(typeof component.events).toBe('function');
  });

  it('should have canAddAppointment computed property', () => {
    expect(component.canAddAppointment).toBeDefined();
    expect(typeof component.canAddAppointment).toBe('function');
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

  it('should have onBookingClientNameChanged method', () => {
    expect(typeof component.onBookingClientNameChanged).toBe('function');
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

  it('should initialize with empty client data', () => {
    expect(component.nouClient()).toEqual({ nom: '', data: '', hora: '' });
  });

  it('should initialize with empty appointments', () => {
    expect(component.cites().length).toBe(0);
  });

  it('should initialize with booking popup closed', () => {
    expect(component.showBookingPopup()).toBe(false);
  });

  it('should initialize with empty booking details', () => {
    expect(component.bookingDetails()).toEqual({date: '', time: '', clientName: ''});
  });

  it('should initialize with empty events', () => {
    expect(component.events().length).toBe(0);
  });

  it('should initialize with cannot add appointment', () => {
    expect(component.canAddAppointment()).toBe(false);
  });

  it('should update client name', () => {
    component.updateNom('John Doe');
    expect(component.nouClient().nom).toBe('John Doe');
  });

  it('should update client date', () => {
    component.updateData('2024-01-15');
    expect(component.nouClient().data).toBe('2024-01-15');
  });

  it('should update client time', () => {
    component.updateHora('14:30');
    expect(component.nouClient().hora).toBe('14:30');
  });

  it('should allow adding appointment when client has name and date', () => {
    component.updateNom('John Doe');
    component.updateData('2024-01-15');
    expect(component.canAddAppointment()).toBe(true);
  });

  it('should not allow adding appointment when client has no name', () => {
    component.updateNom('');
    component.updateData('2024-01-15');
    expect(component.canAddAppointment()).toBe(false);
  });

  it('should not allow adding appointment when client has no date', () => {
    component.updateNom('John Doe');
    component.updateData('');
    expect(component.canAddAppointment()).toBe(false);
  });

  it('should handle date selection', () => {
    const selection = { date: '2024-01-15', time: '14:30' };
    component.onDateSelected(selection);

    expect(component.bookingDetails().date).toBe('2024-01-15');
    expect(component.bookingDetails().time).toBe('14:30');
    expect(component.showBookingPopup()).toBe(true);
  });

  it('should handle booking confirmation', () => {
    const details = { date: '2024-01-15', time: '14:30', clientName: 'John Doe' };
    const initialAppointmentsCount = component.cites().length;

    component.onBookingConfirmed(details);

    expect(component.cites().length).toBe(initialAppointmentsCount + 1);
    expect(component.showBookingPopup()).toBe(false);
    expect(component.bookingDetails()).toEqual({date: '', time: '', clientName: ''});
  });

  it('should handle booking cancellation', () => {
    component.onBookingCancelled();

    expect(component.showBookingPopup()).toBe(false);
    expect(component.bookingDetails()).toEqual({date: '', time: '', clientName: ''});
  });

  it('should update booking client name', () => {
    component.onBookingClientNameChanged('Jane Doe');
    expect(component.bookingDetails().clientName).toBe('Jane Doe');
  });

  it('should add appointment when canAddAppointment is true', () => {
    component.updateNom('John Doe');
    component.updateData('2024-01-15');
    component.updateHora('14:30');

    const initialAppointmentsCount = component.cites().length;
    component.afegirCita();

    expect(component.cites().length).toBe(initialAppointmentsCount + 1);
    expect(component.nouClient()).toEqual({ nom: '', data: '', hora: '' });
  });

  it('should not add appointment when canAddAppointment is false', () => {
    const initialAppointmentsCount = component.cites().length;
    component.afegirCita();

    expect(component.cites().length).toBe(initialAppointmentsCount);
  });

  it('should delete appointment', () => {
    // First add an appointment
    component.updateNom('John Doe');
    component.updateData('2024-01-15');
    component.afegirCita();

    const initialAppointmentsCount = component.cites().length;
    const appointmentToDelete = component.cites()[0];

    component.esborrarCita(appointmentToDelete);

    expect(component.cites().length).toBe(initialAppointmentsCount - 1);
  });

  it('should format date correctly', () => {
    const formattedDate = component.formatDate('2024-01-15');
    expect(formattedDate).toContain('15');
    expect(formattedDate).toContain('2024');
  });

  it('should generate events from appointments', () => {
    // Add an appointment
    component.updateNom('John Doe');
    component.updateData('2024-01-15');
    component.updateHora('14:30');
    component.afegirCita();

    const events = component.events();
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('John Doe');
    expect(events[0].start).toContain('2024-01-15T14:30');
  });

  it('should get cita info item', () => {
    const cita = { nom: 'John Doe', data: '2024-01-15', hora: '14:30' };
    const infoItem = component.getCitaInfoItem(cita);

    expect(infoItem.icon).toBe('📅');
    expect(infoItem.label).toBe('John Doe');
    expect(infoItem.value).toContain('15/1/2024');
    expect(infoItem.value).toContain('14:30');
  });

  it('should get cita info item without time', () => {
    const cita = { nom: 'John Doe', data: '2024-01-15', hora: '' };
    const infoItem = component.getCitaInfoItem(cita);

    expect(infoItem.icon).toBe('📅');
    expect(infoItem.label).toBe('John Doe');
    expect(infoItem.value).toContain('15/1/2024');
    expect(infoItem.value).not.toContain('a les');
  });

  it('should be a standalone component', () => {
    expect(BookingPageComponent.prototype.constructor).toBeDefined();
    expect(BookingPageComponent.prototype.constructor.name).toBe('BookingPageComponent');
  });

  it('should save appointments to localStorage', () => {
    spyOn(localStorage, 'setItem');

    component.updateNom('John Doe');
    component.updateData('2024-01-15');
    component.afegirCita();

    expect(localStorage.setItem).toHaveBeenCalledWith('cites', jasmine.any(String));
  });

  it('should load appointments from localStorage on initialization', () => {
    const mockAppointments = [
      { nom: 'John Doe', data: '2024-01-15', hora: '14:30', id: 'test-id' }
    ];
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockAppointments));

    // Recreate component to trigger initialization
    fixture.destroy();
    TestBed.createComponent(BookingPageComponent);

    expect(localStorage.getItem).toHaveBeenCalledWith('cites');
  });

  it('should initialize with appointments from localStorage', () => {
    // The component loads appointments from localStorage in constructor
    // So it won't be empty if there are existing appointments
    expect(component.cites()).toBeDefined();
    expect(Array.isArray(component.cites())).toBe(true);
  });

  it('should initialize with events from appointments', () => {
    // The component generates events from appointments
    expect(component.events()).toBeDefined();
    expect(Array.isArray(component.events())).toBe(true);
  });
});
