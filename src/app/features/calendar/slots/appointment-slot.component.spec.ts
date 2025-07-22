import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { AppointmentSlotComponent, AppointmentSlotData } from './appointment-slot.component';
import { CalendarPositionService } from '../services/calendar-position.service';
import { AppointmentEvent } from '../core/calendar.component';
import { ServiceColorsService } from '../../../core/services/service-colors.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointment-slot
      [data]="testData()"
      (clicked)="onClicked()">
    </pelu-appointment-slot>
  `,
  imports: [AppointmentSlotComponent],
  standalone: true
})
class TestWrapperComponent {
  testData = signal<AppointmentSlotData | null>(null);

  onClicked() {
    // Test method
  }
}

describe('AppointmentSlotComponent', () => {
  let component: AppointmentSlotComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let wrapperComponent: TestWrapperComponent;

  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockTranslateStore: jasmine.SpyObj<TranslateStore>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockServiceColorsService: jasmine.SpyObj<ServiceColorsService>;
  let mockCalendarPositionService: jasmine.SpyObj<CalendarPositionService>;

  const mockAppointmentData: AppointmentSlotData = {
    appointment: {
      id: '1',
      title: 'Test Appointment',
      start: '2024-01-15T10:00:00',
      duration: 60,
      serviceName: 'Haircut',
      clientName: 'John Doe'
    },
    date: new Date('2024-01-15')
  };

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get', 'use', 'addLangs', 'getBrowserLang', 'reloadLang']);
    mockTranslateService.instant.and.returnValue('Default Service');
    mockTranslateService.get.and.returnValue(of('Default Service'));
    mockTranslateService.addLangs.and.returnValue();
    mockTranslateService.getBrowserLang.and.returnValue('ca');
    mockTranslateService.reloadLang.and.returnValue(of({}));

    mockTranslateStore = jasmine.createSpyObj('TranslateStore', ['onLangChange', 'onDefaultLangChange', 'onTranslationChange']);
    mockTranslateStore.onLangChange = new EventEmitter();
    mockTranslateStore.onDefaultLangChange = new EventEmitter();
    mockTranslateStore.onTranslationChange = new EventEmitter();

    mockTranslationService = jasmine.createSpyObj('TranslationService', ['get', 'get$', 'setLanguage', 'getLanguage']);
    mockTranslationService.get.and.returnValue('Mocked Translation');
    mockTranslationService.get$.and.returnValue(of('Mocked Translation'));
    mockTranslationService.setLanguage.and.returnValue();
    mockTranslationService.getLanguage.and.returnValue('ca');

    mockServiceColorsService = jasmine.createSpyObj('ServiceColorsService', ['getServiceColor', 'getServiceCssClass', 'getServiceTextCssClass']);
    mockServiceColorsService.getServiceColor.and.returnValue({
      id: 'default',
      translationKey: 'SERVICES.COLORS.DEFAULT',
      color: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      textColor: '#000000'
    });
    mockServiceColorsService.getServiceCssClass.and.returnValue('service-color-default');
    mockServiceColorsService.getServiceTextCssClass.and.returnValue('service-text-default');

    mockCalendarPositionService = jasmine.createSpyObj('CalendarPositionService', ['getAppointmentPosition']);
    mockCalendarPositionService.getAppointmentPosition.and.returnValue({ top: 0, height: 60 });

    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TranslateStore, useValue: mockTranslateStore },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ServiceColorsService, useValue: mockServiceColorsService },
        { provide: CalendarPositionService, useValue: mockCalendarPositionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit appointment when clicked', () => {
    spyOn(component.clicked, 'emit');

    wrapperComponent.testData.set(mockAppointmentData);
    fixture.detectChanges();

    const slotElement = fixture.nativeElement.querySelector('.appointment');
    slotElement.click();

    expect(component.clicked.emit).toHaveBeenCalledWith(mockAppointmentData.appointment);
  });

  it('should display appointment information correctly', () => {
    wrapperComponent.testData.set(mockAppointmentData);
    fixture.detectChanges();

    const slotElement = fixture.nativeElement.querySelector('.appointment');
    expect(slotElement).toBeTruthy();
    expect(slotElement.textContent).toContain('Test Appointment');
  });

  it('should handle missing data gracefully', () => {
    // Don't set any data, just test that component doesn't crash
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
