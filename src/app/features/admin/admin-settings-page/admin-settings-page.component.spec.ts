import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AdminSettingsPageComponent } from './admin-settings-page.component';
import { BusinessSettingsService } from '../../../core/services/business-settings.service';
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
  let businessSettingsService: jasmine.SpyObj<BusinessSettingsService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let userService: jasmine.SpyObj<UserService>;

  const mockSettings = {
    businessName: 'Test Salon',
    businessHours: {
      start: 8,
      end: 20,
      lunchStart: 13,
      lunchEnd: 14,
    },
    businessHoursString: {
      start: '08:00',
      end: '20:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
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
  };

  beforeEach(async () => {
    const businessSettingsSpy = jasmine.createSpyObj('BusinessSettingsService', [
      'loadSettings',
      'saveSettings',
      'updateBusinessHoursString',
      'resetToDefaults',
      'getBusinessHoursString',
      'getLunchBreak',
    ], {
      settings: of(mockSettings),
      loading: of(false),
      error: of(null),
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
    businessSettingsSpy.getBusinessHoursString.and.returnValue({
      start: '08:00',
      end: '20:00',
    });
    businessSettingsSpy.getLunchBreak.and.returnValue({
      start: '13:00',
      end: '14:00',
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
        { provide: BusinessSettingsService, useValue: businessSettingsSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    businessSettingsService = TestBed.inject(BusinessSettingsService) as jasmine.SpyObj<BusinessSettingsService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;

    fixture = TestBed.createComponent(AdminSettingsPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    resetMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default settings', () => {
      fixture.detectChanges();
      expect(component.settings()).toEqual(mockSettings);
    });

    it('should load settings on init', () => {
      fixture.detectChanges();
      expect(businessSettingsService.loadSettings).toHaveBeenCalled();
    });

    it('should initialize form with current settings', () => {
      fixture.detectChanges();
      expect(component.settingsForm).toBeDefined();
      expect(component.settingsForm.get('businessName')?.value).toBe('Test Salon');
      expect(component.settingsForm.get('appointmentDuration')?.value).toBe(60);
    });

    it('should start in view mode (not edit mode)', () => {
      fixture.detectChanges();
      expect(component.isEditMode()).toBeFalse();
    });
  });

  describe('Edit Mode Management', () => {
    it('should toggle edit mode correctly', () => {
      fixture.detectChanges();

      // Initially not in edit mode
      expect(component.isEditMode()).toBeFalse();

      // Toggle to edit mode
      component.toggleEditMode();
      expect(component.isEditMode()).toBeTrue();

      // Toggle back to view mode
      component.toggleEditMode();
      expect(component.isEditMode()).toBeFalse();
    });

    it('should set edit mode', () => {
      fixture.detectChanges();
      component.setEditMode();
      expect(component.isEditMode()).toBeTrue();
    });

    it('should set view mode', () => {
      fixture.detectChanges();
      component.setEditMode();
      component.setViewMode();
      expect(component.isEditMode()).toBeFalse();
    });
  });

  describe('Time Input Handling', () => {
    it('should convert time string to Date object correctly', () => {
      const timeString = '14:30';
      const result = component.getTimeValue(timeString);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getHours()).toBe(14);
      expect(result?.getMinutes()).toBe(30);
    });

    it('should return null for invalid time string', () => {
      const result = component.getTimeValue('invalid');
      expect(result).toBeNull();
    });

    it('should return null for empty time string', () => {
      const result = component.getTimeValue('');
      expect(result).toBeNull();
    });

    it('should handle time change correctly', () => {
      fixture.detectChanges();
      const testDate = new Date();
      testDate.setHours(15, 30, 0, 0);

      component.onTimeChange(testDate, 'businessHoursStart');

      expect(component.settingsForm.get('businessHoursStart')?.value).toBe('15:30');
    });

    it('should handle null date in time change', () => {
      fixture.detectChanges();
      component.onTimeChange(null, 'businessHoursStart');
      expect(component.settingsForm.get('businessHoursStart')?.value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should have valid form with default values', () => {
      fixture.detectChanges();
      expect(component.settingsForm.valid).toBeTrue();
    });

    it('should validate required fields', () => {
      fixture.detectChanges();
      const businessNameControl = component.settingsForm.get('businessName');
      businessNameControl?.setValue('');
      expect(businessNameControl?.valid).toBeFalse();
    });

    it('should validate numeric fields', () => {
      fixture.detectChanges();
      const durationControl = component.settingsForm.get('appointmentDuration');
      durationControl?.setValue(-1);
      expect(durationControl?.valid).toBeFalse();
    });
  });

  describe('Save Settings', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.setEditMode();
    });

    it('should save settings successfully', async () => {
      businessSettingsService.updateBusinessHoursString.and.returnValue(Promise.resolve());
      businessSettingsService.saveSettings.and.returnValue(Promise.resolve());

      await component.saveSettings();

      expect(businessSettingsService.updateBusinessHoursString).toHaveBeenCalled();
      expect(businessSettingsService.saveSettings).toHaveBeenCalled();
      expect(toastService.showSuccess).toHaveBeenCalled();
      expect(component.isEditMode()).toBeFalse(); // Should return to view mode
    });

    it('should handle save errors', async () => {
      businessSettingsService.saveSettings.and.returnValue(Promise.reject(new Error('Save failed')));

      await component.saveSettings();

      expect(toastService.showError).toHaveBeenCalled();
    });

    it('should update currency if changed', async () => {
      businessSettingsService.updateBusinessHoursString.and.returnValue(Promise.resolve());
      businessSettingsService.saveSettings.and.returnValue(Promise.resolve());

      component.settingsForm.get('currency')?.setValue('USD');

      await component.saveSettings();

      expect(currencyService.setCurrentCurrency).toHaveBeenCalledWith('USD');
    });
  });

  describe('Reset to Defaults', () => {
    it('should reset settings to defaults', async () => {
      businessSettingsService.resetToDefaults.and.returnValue(Promise.resolve());

      await component.resetToDefaults();

      expect(businessSettingsService.resetToDefaults).toHaveBeenCalled();
      expect(toastService.showInfo).toHaveBeenCalled();
    });

    it('should handle reset errors', async () => {
      businessSettingsService.resetToDefaults.and.returnValue(Promise.reject(new Error('Reset failed')));

      await component.resetToDefaults();

      expect(toastService.showError).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should get language label correctly', () => {
      const result = component.getLanguageLabel('ca');
      expect(result).toBe('Català');
    });

    it('should get currency label correctly', () => {
      const result = component.getCurrencyLabel('EUR');
      expect(result).toBe('Euro (€)');
    });

    it('should get business hours display', () => {
      const result = component.getBusinessHoursDisplay();
      expect(result).toBe('08:00 - 20:00');
    });

    it('should get lunch break display', () => {
      const result = component.getLunchBreakDisplay();
      expect(result).toBe('13:00 - 14:00');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display three columns in desktop layout', () => {
      const columns = fixture.nativeElement.querySelectorAll('.settings-column');
      expect(columns.length).toBe(3);
    });

    it('should show edit button in header', () => {
      const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]') ||
                        fixture.nativeElement.querySelector('pelu-button');
      expect(editButton).toBeTruthy();
    });

    it('should show save actions only in edit mode', () => {
      // Initially not in edit mode
      let saveActions = fixture.nativeElement.querySelector('.settings-actions');
      expect(saveActions).toBeFalsy();

      // Switch to edit mode
      component.setEditMode();
      fixture.detectChanges();

      saveActions = fixture.nativeElement.querySelector('.settings-actions');
      expect(saveActions).toBeTruthy();
    });

    it('should display correct column titles', () => {
      const titles = fixture.nativeElement.querySelectorAll('.column-title');
      expect(titles.length).toBe(3);
    });

    it('should have time inputs for business hours', () => {
      const timeInputs = fixture.nativeElement.querySelectorAll('pelu-input-date');
      expect(timeInputs.length).toBeGreaterThan(0);
    });

    it('should have number inputs for numeric values', () => {
      const numberInputs = fixture.nativeElement.querySelectorAll('pelu-input-number');
      expect(numberInputs.length).toBeGreaterThan(0);
    });

    it('should have select inputs for language and currency', () => {
      const selectInputs = fixture.nativeElement.querySelectorAll('pelu-input-select');
      expect(selectInputs.length).toBeGreaterThan(0);
    });

    it('should have checkbox inputs for boolean options', () => {
      const checkboxInputs = fixture.nativeElement.querySelectorAll('pelu-input-checkbox');
      expect(checkboxInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      fixture.detectChanges();
      const grid = fixture.nativeElement.querySelector('.settings-grid');
      expect(grid).toBeTruthy();
      expect(grid.style.display).toBe('grid');
    });

    it('should have proper column structure', () => {
      fixture.detectChanges();
      const columns = fixture.nativeElement.querySelectorAll('.settings-column');
      columns.forEach((column: HTMLElement) => {
        expect(column.style.display).toBe('flex');
        expect(column.style.flexDirection).toBe('column');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state on save button when saving', () => {
      fixture.detectChanges();
      component.setEditMode();
      component.saving.set(true);
      fixture.detectChanges();

      const saveButton = fixture.nativeElement.querySelector('pelu-button[type="submit"]');
      expect(saveButton).toBeTruthy();
    });

    it('should disable buttons during save operation', () => {
      fixture.detectChanges();
      component.setEditMode();
      component.saving.set(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('pelu-button');
      buttons.forEach((button: HTMLElement) => {
        // Check if button has disabled attribute or class
        expect(button.hasAttribute('disabled') || button.classList.contains('disabled')).toBeTruthy();
      });
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.setEditMode();
    });

    it('should update form values when inputs change', () => {
      const businessNameInput = component.settingsForm.get('businessName');
      businessNameInput?.setValue('New Business Name');
      expect(businessNameInput?.value).toBe('New Business Name');
    });

    it('should handle checkbox changes', () => {
      const autoConfirmCheckbox = component.settingsForm.get('autoConfirm');
      autoConfirmCheckbox?.setValue(true);
      expect(autoConfirmCheckbox?.value).toBeTrue();
    });

    it('should show cancellation time limit when prevent cancellation is enabled', () => {
      const preventCancellationCheckbox = component.settingsForm.get('preventCancellation');
      preventCancellationCheckbox?.setValue(true);
      fixture.detectChanges();

      // The cancellation time limit field should be visible
      const cancellationTimeLimitField = fixture.nativeElement.querySelector('[formControlName="cancellationTimeLimit"]');
      expect(cancellationTimeLimitField).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle business settings service errors', () => {
      businessSettingsService.loadSettings.and.returnValue(Promise.reject(new Error('Load failed')));

      fixture.detectChanges();

      expect(toastService.showError).toHaveBeenCalled();
    });

    it('should handle invalid form submission', () => {
      fixture.detectChanges();
      component.setEditMode();

      // Make form invalid
      component.settingsForm.get('businessName')?.setValue('');

      const saveSpy = spyOn(businessSettingsService, 'saveSettings');

      component.saveSettings();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});
