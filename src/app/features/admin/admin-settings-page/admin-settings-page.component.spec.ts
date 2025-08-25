import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { computed } from '@angular/core';
import { AdminSettingsPageComponent } from './admin-settings-page.component';
import { SystemParametersService } from '../../../core/services/system-parameters.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/components/inputs/input-number/input-number.component';
import { InputCheckboxComponent } from '../../../shared/components/inputs/input-checkbox/input-checkbox.component';
import { InputSelectComponent } from '../../../shared/components/inputs/input-select/input-select.component';
import { InputDateComponent } from '../../../shared/components/inputs/input-date/input-date.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { resetMocks } from '../../../../testing/test-setup';

describe('AdminSettingsPageComponent', () => {
  let component: AdminSettingsPageComponent;
  let fixture: ComponentFixture<AdminSettingsPageComponent>;
  let systemParametersService: jasmine.SpyObj<SystemParametersService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockSettings = {
    businessName: 'Test Salon',
    businessHours: {
      start: 8,
      end: 20,
      lunchStart: 13,
      lunchEnd: 14,
    },

    workingDays: [1, 2, 3, 4, 5, 6],
    appointmentDuration: 60,
    maxAppointmentsPerDay: 20,
    autoConfirmAppointments: false,
    sendNotifications: true,
    backupFrequency: 'daily',
    language: 'ca',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    preventCancellation: false,
    cancellationTimeLimit: 24,
    bookingAdvanceDays: 30,
    bookingAdvanceTime: 30,
    lastUpdated: Date.now(),
    version: '1.0.0',
  };

  beforeEach(async () => {
    const systemParametersSpy = jasmine.createSpyObj('SystemParametersService', [
      'loadParameters',
      'saveParameters',
      'updateBusinessHours',
      'getLunchBreak',
      'getBusinessHours',
    ], {
      parameters: computed(() => mockSettings),
      loading: computed(() => false),
      error: computed(() => null),
    });

    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', [
      'getCurrentCurrency',
      'setCurrentCurrency',
      'getCurrencyOptions',
    ]);

    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
      'showInfo',
    ]);

    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUser',
    ]);

    // Configure default return values
    systemParametersSpy.getLunchBreak.and.returnValue({
      start: 13,
      end: 14,
    });
    systemParametersSpy.getBusinessHours.and.returnValue({
      start: 8,
      end: 20,
    });
    currencyServiceSpy.getCurrentCurrency.and.returnValue('EUR');
    currencyServiceSpy.getCurrencyOptions.and.returnValue([
      { label: 'Euro (€)', value: 'EUR' },
      { label: 'Dollar ($)', value: 'USD' },
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        AdminSettingsPageComponent,
        InputTextComponent,
        InputNumberComponent,
        InputCheckboxComponent,
        InputSelectComponent,
        InputDateComponent,
        ButtonComponent,
      ],
      providers: [
        { provide: SystemParametersService, useValue: systemParametersSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    systemParametersService = TestBed.inject(SystemParametersService) as jasmine.SpyObj<SystemParametersService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    fixture = TestBed.createComponent(AdminSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    resetMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load settings on init', () => {
      fixture.detectChanges();
      expect(component.settingsForm).toBeDefined();
    });
  });

  describe('Form Management', () => {
    it('should initialize form with current settings', () => {
      fixture.detectChanges();
      expect(component.settingsForm).toBeDefined();
      expect(component.settingsForm.get('businessName')?.value).toBe('Test Salon');
    });

    it('should update form when settings change', () => {
      fixture.detectChanges();
      expect(component.settingsForm.get('appointmentDuration')?.value).toBe(60);
    });
  });

  describe('Save Settings', () => {
    it('should save settings successfully', async () => {
      systemParametersService.updateBusinessHours.and.returnValue(Promise.resolve());
      systemParametersService.saveParameters.and.returnValue(Promise.resolve());

      await component.saveSettings();

      expect(systemParametersService.updateBusinessHours).toHaveBeenCalled();
      expect(systemParametersService.saveParameters).toHaveBeenCalled();
      expect(toastService.showSuccess).toHaveBeenCalled();
      expect(component.isEditMode()).toBeFalse(); // Should return to view mode
    });

    it('should handle save errors', async () => {
      systemParametersService.saveParameters.and.returnValue(Promise.reject(new Error('Save failed')));

      await component.saveSettings();

      expect(toastService.showError).toHaveBeenCalled();
    });

    it('should update currency if changed', async () => {
      systemParametersService.updateBusinessHours.and.returnValue(Promise.resolve());
      systemParametersService.saveParameters.and.returnValue(Promise.resolve());

      component.settingsForm.get('currency')?.setValue('USD');

      await component.saveSettings();

      expect(currencyService.setCurrentCurrency).toHaveBeenCalledWith('USD');
    });
  });


});
