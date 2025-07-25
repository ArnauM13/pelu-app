import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CalendarFooterComponent, CalendarFooterAlert } from './calendar-footer.component';

class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'CALENDAR.FOOTER.INFO_NOTE': 'Mocked info note',
    });
  }
}

describe('CalendarFooterComponent', () => {
  let component: CalendarFooterComponent;
  let fixture: ComponentFixture<CalendarFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalendarFooterComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarFooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.alerts()).toEqual([]);
  });

  it('should have computed properties', () => {
    expect(component.visibleAlerts()).toEqual([]);
    expect(component.hasAlerts()).toBe(false);
  });

  it('should show footer', () => {
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.calendar-footer');
    expect(footer).toBeTruthy();
  });

  it('should show info note', () => {
    fixture.detectChanges();
    const infoNote = fixture.nativeElement.querySelector('.info-note');
    expect(infoNote).toBeTruthy();
    expect(infoNote.textContent).toContain('📅');
  });

  it('should not show alerts section when no alerts', () => {
    fixture.detectChanges();
    const alertsSection = fixture.nativeElement.querySelector('.footer-alerts');
    expect(alertsSection).toBeFalsy();
  });

  it('should compute hasAlerts correctly for empty array', () => {
    expect(component.hasAlerts()).toBe(false);
  });

  it('should compute visibleAlerts correctly for empty array', () => {
    expect(component.visibleAlerts()).toEqual([]);
  });
});
