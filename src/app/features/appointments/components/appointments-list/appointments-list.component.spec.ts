import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsListComponent, Appointment } from './appointments-list.component';

describe('AppointmentsListComponent', () => {
  let component: AppointmentsListComponent;
  let fixture: ComponentFixture<AppointmentsListComponent>;

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      nom: 'John Doe',
      data: '2024-01-15',
      hora: '10:00',
      servei: 'Corte de pelo',
      serviceName: 'Haircut',
      duration: 60,
      userId: 'user1'
    },
    {
      id: '2',
      nom: 'Jane Smith',
      data: '2024-01-15',
      hora: '14:00',
      servei: 'Coloración',
      serviceName: 'Hair Coloring',
      duration: 120,
      userId: 'user2'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppointmentsListComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            get: (key: string) => ({ subscribe: (fn: any) => fn(key) })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display appointments correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('Jane Smith');
    expect(compiled.textContent).toContain('10:00');
    expect(compiled.textContent).toContain('14:00');
  });

  it('should emit view appointment event when appointment is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.onViewAppointment, 'emit');

    const firstAppointment = compiled.querySelector('.appointment-item');
    firstAppointment.click();

    expect(spy).toHaveBeenCalledWith(mockAppointments[0]);
  });

  it('should emit delete appointment event when delete button is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.onDeleteAppointment, 'emit');

    const deleteButton = compiled.querySelector('.btn-danger');
    deleteButton.click();

    expect(spy).toHaveBeenCalledWith(mockAppointments[0]);
  });

  it('should emit clear filters event when clear filters button is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.onClearFilters, 'emit');

    const clearFiltersButton = compiled.querySelector('.btn-primary');
    clearFiltersButton.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should display empty state when no appointments', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('NO_APPOINTMENTS');
  });

  it('should have correct number of appointment items', () => {
    const compiled = fixture.nativeElement;
    const appointmentItems = compiled.querySelectorAll('.appointment-item');

    expect(appointmentItems.length).toBe(2);
  });

  it('should format time correctly', () => {
    const result = component.formatTime('10:30');
    expect(result).toBe('10:30');
  });

  it('should identify today correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = component.isToday(today);
    expect(result).toBe(true);
  });
});
