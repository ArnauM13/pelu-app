import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { AppointmentsStatsComponent, AppointmentStats } from './appointments-stats.component';
import { Component, signal } from '@angular/core';
import { of } from 'rxjs';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointments-stats
      [stats]="stats()"
      (onQuickFilterChange)="onQuickFilterChange($event)">
    </pelu-appointments-stats>
  `,
  imports: [AppointmentsStatsComponent],
  standalone: true
})
class TestWrapperComponent {
  stats = signal<AppointmentStats>({
    total: 10,
    today: 3,
    upcoming: 7,
    mine: 5
  });

  onQuickFilterChange(filter: 'all' | 'today' | 'upcoming' | 'mine') {}
}

describe('AppointmentsStatsComponent', () => {
  let component: AppointmentsStatsComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let wrapperComponent: TestWrapperComponent;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const translateSpy = jasmine.createSpyObj('TranslateService', ['get', 'instant', 'addLangs', 'getBrowserLang', 'use', 'reloadLang', 'setDefaultLang', 'getDefaultLang', 'getLangs']);

    await TestBed.configureTestingModule({
      imports: [
        TestWrapperComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: TranslateService, useValue: translateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default mock return values
    translateService.get.and.returnValue(of('translated text'));
    translateService.instant.and.returnValue('translated text');
    translateService.addLangs.and.returnValue(undefined);
    translateService.getBrowserLang.and.returnValue('ca');
    translateService.use.and.returnValue(of({}));
    translateService.reloadLang.and.returnValue(of({}));
    translateService.setDefaultLang.and.returnValue(undefined);
    translateService.getDefaultLang.and.returnValue('ca');
    translateService.getLangs.and.returnValue(['ca', 'es', 'en', 'ar']);

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
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
