import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsStatsComponent, AppointmentStats } from './appointments-stats.component';

describe('AppointmentsStatsComponent', () => {
  let component: AppointmentsStatsComponent;
  let fixture: ComponentFixture<AppointmentsStatsComponent>;

  const mockStats: AppointmentStats = {
    total: 10,
    today: 3,
    upcoming: 7,
    mine: 5
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppointmentsStatsComponent,
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

    fixture = TestBed.createComponent(AppointmentsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all statistics correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('10'); // total
    expect(compiled.textContent).toContain('3');  // today
    expect(compiled.textContent).toContain('7');  // upcoming
    expect(compiled.textContent).toContain('5');  // mine
  });

  it('should emit quick filter change when stat card is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.onQuickFilterChange, 'emit');

    // Click on the first stat card (total)
    const firstStatCard = compiled.querySelector('.stat-card');
    firstStatCard.click();

    expect(spy).toHaveBeenCalledWith('all');
  });

  it('should have correct number of stat cards', () => {
    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');

    expect(statCards.length).toBe(4);
  });

  it('should display correct icons for each stat', () => {
    const compiled = fixture.nativeElement;
    const statIcons = compiled.querySelectorAll('.stat-icon');

    expect(statIcons[0].textContent).toContain('📅'); // total
    expect(statIcons[1].textContent).toContain('🎯'); // today
    expect(statIcons[2].textContent).toContain('⏰'); // upcoming
    expect(statIcons[3].textContent).toContain('👨'); // mine
  });
});
