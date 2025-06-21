import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { BookingPageComponent } from './booking-page.component';
import { AuthService } from '../../auth/auth.service';

describe('BookingPageComponent', () => {
  let component: BookingPageComponent;
  let fixture: ComponentFixture<BookingPageComponent>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('[]');
    spyOn(localStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [BookingPageComponent],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPageComponent);
    component = fixture.componentInstance;
    mockMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty client data', () => {
    expect(component.nouClient().nom).toBe('');
    expect(component.nouClient().data).toBe('');
    expect(component.nouClient().hora).toBe('');
  });

  it('should initialize with empty appointments array', () => {
    expect(component.cites().length).toBe(0);
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

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should create info item from appointment', () => {
    const cita = { nom: 'John Doe', data: '2024-01-15', hora: '14:30' };
    const infoItem = component.getCitaInfoItem(cita);
    expect(infoItem.label).toBe('John Doe');
    expect(infoItem.icon).toBe('📅');
  });
});
