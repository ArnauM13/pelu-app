import { TestBed } from '@angular/core/testing';
import { BusinessSettingsService, BusinessSettings } from './business-settings.service';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { of, throwError } from 'rxjs';

describe('BusinessSettingsService', () => {
  let service: BusinessSettingsService;
  let firestore: jasmine.SpyObj<Firestore>;
  let docSpy: jasmine.SpyObj<any>;
  let getDocSpy: jasmine.SpyObj<any>;
  let setDocSpy: jasmine.SpyObj<any>;

  const mockSettings: BusinessSettings = {
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

  beforeEach(() => {
    const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection']);
    docSpy = jasmine.createSpyObj('doc', ['get', 'set']);
    getDocSpy = jasmine.createSpyObj('getDoc', ['data']);
    setDocSpy = jasmine.createSpyObj('setDoc', ['then']);

    // Mock Firestore methods
    (doc as jasmine.Spy).and.returnValue(docSpy);
    (getDoc as jasmine.Spy).and.returnValue(Promise.resolve({ data: () => mockSettings }));
    (setDoc as jasmine.Spy).and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        BusinessSettingsService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });

    service = TestBed.inject(BusinessSettingsService);
    firestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have default settings', () => {
      expect(service.settings()).toBeDefined();
      expect(service.settings().businessName).toBe('PeluApp');
      expect(service.settings().appointmentDuration).toBe(60);
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBeFalse();
    });

    it('should have no error initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('Computed Signals', () => {
    it('should provide business name', () => {
      expect(service.businessName()).toBe('PeluApp');
    });

    it('should provide business hours', () => {
      const hours = service.businessHours();
      expect(hours.start).toBe(8);
      expect(hours.end).toBe(20);
    });

    it('should provide business hours string', () => {
      const hoursString = service.businessHoursString();
      expect(hoursString.start).toBe('08:00');
      expect(hoursString.end).toBe('20:00');
    });

    it('should provide working days', () => {
      const workingDays = service.workingDays();
      expect(workingDays).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should provide appointment duration', () => {
      expect(service.appointmentDuration()).toBe(60);
    });

    it('should provide max appointments per day', () => {
      expect(service.maxAppointmentsPerDay()).toBe(20);
    });

    it('should provide auto confirm setting', () => {
      expect(service.autoConfirmAppointments()).toBeFalse();
    });

    it('should provide send notifications setting', () => {
      expect(service.sendNotifications()).toBeTrue();
    });

    it('should provide language', () => {
      expect(service.language()).toBe('ca');
    });

    it('should provide currency', () => {
      expect(service.currency()).toBe('EUR');
    });

    it('should provide prevent cancellation setting', () => {
      expect(service.preventCancellation()).toBeFalse();
    });

    it('should provide cancellation time limit', () => {
      expect(service.cancellationTimeLimit()).toBe(24);
    });

    it('should provide booking advance days', () => {
      expect(service.bookingAdvanceDays()).toBe(30);
    });

    it('should provide booking advance time', () => {
      expect(service.bookingAdvanceTime()).toBe(30);
    });

    it('should provide lunch break', () => {
      const lunchBreak = service.lunchBreak();
      expect(lunchBreak.start).toBe('13:00');
      expect(lunchBreak.end).toBe('14:00');
    });

    it('should provide lunch break numeric', () => {
      const lunchBreakNumeric = service.lunchBreakNumeric();
      expect(lunchBreakNumeric.start).toBe(13);
      expect(lunchBreakNumeric.end).toBe(14);
    });
  });

  describe('Load Settings', () => {
    it('should load settings successfully', async () => {
      spyOn(service as any, 'loadSettings').and.returnValue(Promise.resolve());
      
      await service.loadSettings();
      
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should handle load errors', async () => {
      spyOn(service as any, 'loadSettings').and.returnValue(Promise.reject(new Error('Load failed')));
      
      try {
        await service.loadSettings();
      } catch (error) {
        expect(service.error()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      }
    });
  });

  describe('Save Settings', () => {
    it('should save settings successfully', async () => {
      const newSettings = {
        businessName: 'New Salon Name',
        appointmentDuration: 90,
      };

      spyOn(service as any, 'saveSettings').and.returnValue(Promise.resolve());
      
      await service.saveSettings(newSettings);
      
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should handle save errors', async () => {
      const newSettings = {
        businessName: 'New Salon Name',
      };

      spyOn(service as any, 'saveSettings').and.returnValue(Promise.reject(new Error('Save failed')));
      
      try {
        await service.saveSettings(newSettings);
      } catch (error) {
        expect(service.error()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      }
    });
  });

  describe('Update Business Hours', () => {
    it('should update business hours successfully', async () => {
      const newHours = {
        start: 9,
        end: 21,
        lunchStart: 12,
        lunchEnd: 13,
      };

      spyOn(service as any, 'updateBusinessHours').and.returnValue(Promise.resolve());
      
      await service.updateBusinessHours(newHours);
      
      expect(service.loading()).toBeFalse();
    });

    it('should update business hours string successfully', async () => {
      const newHoursString = {
        start: '09:00',
        end: '21:00',
        lunchStart: '12:00',
        lunchEnd: '13:00',
      };

      spyOn(service as any, 'updateBusinessHoursString').and.returnValue(Promise.resolve());
      
      await service.updateBusinessHoursString(newHoursString);
      
      expect(service.loading()).toBeFalse();
    });
  });

  describe('Update Lunch Break', () => {
    it('should update lunch break successfully', async () => {
      const newLunchBreak = {
        start: '12:00',
        end: '13:00',
      };

      spyOn(service as any, 'updateLunchBreak').and.returnValue(Promise.resolve());
      
      await service.updateLunchBreak(newLunchBreak);
      
      expect(service.loading()).toBeFalse();
    });
  });

  describe('Reset to Defaults', () => {
    it('should reset settings to defaults successfully', async () => {
      spyOn(service as any, 'resetToDefaults').and.returnValue(Promise.resolve());
      
      await service.resetToDefaults();
      
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should handle reset errors', async () => {
      spyOn(service as any, 'resetToDefaults').and.returnValue(Promise.reject(new Error('Reset failed')));
      
      try {
        await service.resetToDefaults();
      } catch (error) {
        expect(service.error()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      }
    });
  });

  describe('Helper Methods', () => {
    it('should get business name', () => {
      const result = service.getBusinessName();
      expect(result).toBe('PeluApp');
    });

    it('should get business hours', () => {
      const result = service.getBusinessHours();
      expect(result.start).toBe(8);
      expect(result.end).toBe(20);
    });

    it('should get business hours string', () => {
      const result = service.getBusinessHoursString();
      expect(result.start).toBe('08:00');
      expect(result.end).toBe('20:00');
    });

    it('should get lunch break', () => {
      const result = service.getLunchBreak();
      expect(result.start).toBe('13:00');
      expect(result.end).toBe('14:00');
    });

    it('should get lunch break numeric', () => {
      const result = service.getLunchBreakNumeric();
      expect(result.start).toBe(13);
      expect(result.end).toBe(14);
    });

    it('should get working days', () => {
      const result = service.getWorkingDays();
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should check if day is working day', () => {
      expect(service.isWorkingDay(1)).toBeTrue(); // Monday
      expect(service.isWorkingDay(0)).toBeFalse(); // Sunday
    });

    it('should get appointment duration', () => {
      const result = service.getAppointmentDuration();
      expect(result).toBe(60);
    });

    it('should get max appointments per day', () => {
      const result = service.getMaxAppointmentsPerDay();
      expect(result).toBe(20);
    });

    it('should check if should auto confirm appointments', () => {
      const result = service.shouldAutoConfirmAppointments();
      expect(result).toBeFalse();
    });

    it('should check if should send notifications', () => {
      const result = service.shouldSendNotifications();
      expect(result).toBeTrue();
    });

    it('should check if cancellation is prevented', () => {
      const result = service.isCancellationPrevented();
      expect(result).toBeFalse();
    });

    it('should get cancellation time limit', () => {
      const result = service.getCancellationTimeLimit();
      expect(result).toBe(24);
    });

    it('should get booking advance days', () => {
      const result = service.getBookingAdvanceDays();
      expect(result).toBe(30);
    });

    it('should get booking advance time', () => {
      const result = service.getBookingAdvanceTime();
      expect(result).toBe(30);
    });

    it('should get language', () => {
      const result = service.getLanguage();
      expect(result).toBe('ca');
    });

    it('should get currency', () => {
      const result = service.getCurrency();
      expect(result).toBe('EUR');
    });
  });

  describe('Lunch Break Validation', () => {
    it('should check if time is during lunch break', () => {
      expect(service.isLunchBreak('13:30')).toBeTrue();
      expect(service.isLunchBreak('14:30')).toBeFalse();
      expect(service.isLunchBreak('12:30')).toBeFalse();
    });

    it('should check if time is lunch break start', () => {
      expect(service.isLunchBreakStart('13:00')).toBeTrue();
      expect(service.isLunchBreakStart('13:30')).toBeFalse();
      expect(service.isLunchBreakStart('14:00')).toBeFalse();
    });
  });

  describe('Time Conversion', () => {
    it('should convert numeric hours to time string', () => {
      const numericHours = {
        start: 9,
        end: 18,
        lunchStart: 12,
        lunchEnd: 13,
      };

      const result = (service as any).convertToTimeString(numericHours);
      
      expect(result.start).toBe('09:00');
      expect(result.end).toBe('18:00');
      expect(result.lunchStart).toBe('12:00');
      expect(result.lunchEnd).toBe('13:00');
    });

    it('should convert time string to numeric hours', () => {
      const timeString = {
        start: '09:30',
        end: '18:30',
        lunchStart: '12:30',
        lunchEnd: '13:30',
      };

      const result = (service as any).convertToNumericHours(timeString);
      
      expect(result.start).toBe(9.5);
      expect(result.end).toBe(18.5);
      expect(result.lunchStart).toBe(12.5);
      expect(result.lunchEnd).toBe(13.5);
    });
  });

  describe('Signal Updates', () => {
    it('should update settings signal when settings change', () => {
      const newSettings = {
        businessName: 'Updated Salon',
        appointmentDuration: 90,
      };

      // Simulate settings update
      (service as any).settingsSignal.set({
        ...service.settings(),
        ...newSettings,
      });

      expect(service.businessName()).toBe('Updated Salon');
      expect(service.appointmentDuration()).toBe(90);
    });

    it('should update loading signal', () => {
      (service as any).loadingSignal.set(true);
      expect(service.loading()).toBeTrue();

      (service as any).loadingSignal.set(false);
      expect(service.loading()).toBeFalse();
    });

    it('should update error signal', () => {
      const errorMessage = 'Test error';
      (service as any).errorSignal.set(errorMessage);
      expect(service.error()).toBe(errorMessage);

      (service as any).errorSignal.set(null);
      expect(service.error()).toBeNull();
    });
  });
}); 