import { TestBed } from '@angular/core/testing';
import {
  mockTranslateService,
  mockTranslateStore,
  mockTranslationService,
  mockServiceColorsService,
  mockAuthService,
  mockServicesService,
  mockMessageService,
  mockRouter,
  mockActivatedRoute,
  mockRoleService,
  mockCalendarPositionService,
  mockCalendarBusinessService,
  mockCalendarStateService,
  mockAuth,
  mockData
} from './translation-mocks';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../app/core/services/translation.service';
import { ServiceColorsService } from '../app/core/services/service-colors.service';
import { AuthService } from '../app/core/auth/auth.service';
import { ServicesService } from '../app/core/services/services.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from '../app/core/services/role.service';
import { CalendarPositionService } from '../app/features/calendar/calendar-position.service';
import { CalendarBusinessService } from '../app/features/calendar/calendar-business.service';
import { CalendarStateService } from '../app/features/calendar/calendar-state.service';
import { Auth } from '@angular/fire/auth';

/**
 * Configure TestBed with common providers for all tests
 */
export function configureTestBed(components: any[] = [], additionalProviders: any[] = []) {
  const allProviders = [
    { provide: TranslateService, useValue: mockTranslateService },
    { provide: TranslateStore, useValue: mockTranslateStore },
    { provide: TranslationService, useValue: mockTranslationService },
    { provide: ServiceColorsService, useValue: mockServiceColorsService },
    { provide: AuthService, useValue: mockAuthService },
    { provide: ServicesService, useValue: mockServicesService },
    { provide: MessageService, useValue: mockMessageService },
    { provide: Router, useValue: mockRouter },
    { provide: ActivatedRoute, useValue: mockActivatedRoute },
    { provide: RoleService, useValue: mockRoleService },
    { provide: CalendarPositionService, useValue: mockCalendarPositionService },
    { provide: CalendarBusinessService, useValue: mockCalendarBusinessService },
    { provide: CalendarStateService, useValue: mockCalendarStateService },
    { provide: Auth, useValue: mockAuth },
    ...additionalProviders
  ];

  return TestBed.configureTestingModule({
    imports: components,
    providers: allProviders
  });
}

/**
 * Reset all mocks to their initial state
 */
export function resetMocks() {
  // Reset TranslateService mocks
  mockTranslateService.instant.calls.reset();
  mockTranslateService.get.calls.reset();
  mockTranslateService.use.calls.reset();
  mockTranslateService.addLangs.calls.reset();
  mockTranslateService.getBrowserLang.calls.reset();
  mockTranslateService.reloadLang.calls.reset();
  mockTranslateService.setDefaultLang.calls.reset();
  mockTranslateService.getDefaultLang.calls.reset();
  mockTranslateService.getLangs.calls.reset();

  // Reset TranslationService mocks
  mockTranslationService.get.calls.reset();
  mockTranslationService.get$.calls.reset();
  mockTranslationService.setLanguage.calls.reset();
  mockTranslationService.getLanguage.calls.reset();
  mockTranslationService.getCurrentLanguageInfo.calls.reset();
  mockTranslationService.isLanguageAvailable.calls.reset();
  mockTranslationService.isRTL.calls.reset();
  mockTranslationService.reload.calls.reset();
  mockTranslationService.getBrowserLanguage.calls.reset();
  mockTranslationService.saveUserLanguagePreference.calls.reset();
  mockTranslationService.getUserLanguagePreference.calls.reset();
  mockTranslationService.initializeLanguage.calls.reset();

  // Reset ServiceColorsService mocks
  mockServiceColorsService.getServiceColor.calls.reset();
  mockServiceColorsService.getServiceColorClass.calls.reset();
  mockServiceColorsService.getServiceIcon.calls.reset();
  mockServiceColorsService.getServiceTranslation.calls.reset();

  // Reset AuthService mocks
  mockAuthService.currentUser.calls.reset();
  mockAuthService.signIn.calls.reset();
  mockAuthService.signUp.calls.reset();
  mockAuthService.signOut.calls.reset();
  mockAuthService.isAuthenticated.calls.reset();

  // Reset ServicesService mocks
  mockServicesService.getAllServices.calls.reset();
  mockServicesService.getServiceById.calls.reset();
  mockServicesService.addService.calls.reset();
  mockServicesService.updateService.calls.reset();
  mockServicesService.deleteService.calls.reset();

  // Reset MessageService mocks
  mockMessageService.add.calls.reset();
  mockMessageService.clear.calls.reset();
  mockMessageService.addAll.calls.reset();
  mockMessageService.addOne.calls.reset();
  mockMessageService.remove.calls.reset();
  mockMessageService.removeAll.calls.reset();

  // Reset Router mocks
  mockRouter.navigate.calls.reset();
  mockRouter.navigateByUrl.calls.reset();

  // Reset RoleService mocks
  mockRoleService.currentRole.calls.reset();
  mockRoleService.setRole.calls.reset();
      mockRoleService.isAdmin.calls.reset();
  mockRoleService.isClient.calls.reset();
  mockRoleService.initializeRoleListener.calls.reset();

  // Reset Calendar service mocks
  mockCalendarPositionService.calculatePosition.calls.reset();
  mockCalendarPositionService.getTimeSlotPosition.calls.reset();
  mockCalendarPositionService.getDayPosition.calls.reset();

  mockCalendarBusinessService.getBusinessHours.calls.reset();
  mockCalendarBusinessService.getBusinessDays.calls.reset();
  mockCalendarBusinessService.isBusinessDay.calls.reset();
  mockCalendarBusinessService.isBusinessHour.calls.reset();

  mockCalendarStateService.selectedDate.calls.reset();
  mockCalendarStateService.setSelectedDate.calls.reset();
  mockCalendarStateService.selectedTimeSlot.calls.reset();
  mockCalendarStateService.setSelectedTimeSlot.calls.reset();
  mockCalendarStateService.appointments.calls.reset();
  mockCalendarStateService.setAppointments.calls.reset();
}

/**
 * Set up default mock return values
 */
export function setupDefaultMocks() {
  // Set up default return values for commonly used mocks
  mockTranslateService.instant.and.returnValue('Mocked Translation');
  mockTranslateService.get.and.returnValue({ subscribe: () => ({ unsubscribe: () => {} }) });
  mockTranslateService.addLangs.and.returnValue(undefined);
  mockTranslateService.getBrowserLang.and.returnValue('ca');
  mockTranslateService.reloadLang.and.returnValue({ subscribe: () => ({ unsubscribe: () => {} }) });

  mockTranslationService.get.and.returnValue('Mocked Translation');
  mockTranslationService.get$.and.returnValue({ subscribe: () => ({ unsubscribe: () => {} }) });
  mockTranslationService.getLanguage.and.returnValue('ca');
  mockTranslationService.getCurrentLanguageInfo.and.returnValue({
    code: 'ca',
    name: 'Català',
    flag: '🏴󠁥󠁳󠁣󠁴󠁿'
  });

  mockServiceColorsService.getServiceColor.and.returnValue({
    id: 'default',
    translationKey: 'SERVICES.COLORS.DEFAULT',
    color: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    textColor: '#000000'
  });
  mockServiceColorsService.getServiceColorClass.and.returnValue('primary');
  mockServiceColorsService.getServiceIcon.and.returnValue('scissors');
  mockServiceColorsService.getServiceTranslation.and.returnValue('Mocked Service');

  mockAuthService.currentUser.and.returnValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  });
  mockAuthService.isAuthenticated.and.returnValue(true);

  mockServicesService.getAllServices.and.returnValue({ subscribe: () => ({ unsubscribe: () => {} }) });
  mockServicesService.getServiceById.and.returnValue({ subscribe: () => ({ unsubscribe: () => {} }) });

      mockRoleService.currentRole.and.returnValue('client');
    mockRoleService.isClient.and.returnValue(true);
  mockRoleService.isClient.and.returnValue(false);

  mockCalendarPositionService.calculatePosition.and.returnValue({ top: 0, left: 0 });
  mockCalendarPositionService.getTimeSlotPosition.and.returnValue({ top: 0, left: 0 });
  mockCalendarPositionService.getDayPosition.and.returnValue({ top: 0, left: 0 });

  mockCalendarBusinessService.getBusinessHours.and.returnValue({
    start: 8,
    end: 20,
    lunchStart: 13,
    lunchEnd: 14
  });
  mockCalendarBusinessService.getBusinessDays.and.returnValue([1, 2, 3, 4, 5, 6]);
  mockCalendarBusinessService.isBusinessDay.and.returnValue(true);
  mockCalendarBusinessService.isBusinessHour.and.returnValue(true);

  mockCalendarStateService.selectedDate.and.returnValue(new Date());
  mockCalendarStateService.selectedTimeSlot.and.returnValue(null);
  mockCalendarStateService.appointments.and.returnValue([]);
}

/**
 * Create a test component with input signals
 */
export function createTestComponent<T>(componentClass: any, inputs: Record<string, any> = {}): T {
  const component = TestBed.createComponent(componentClass).componentInstance as any;

  // Set input signals
  Object.keys(inputs).forEach(key => {
    if (component[key] && typeof component[key].set === 'function') {
      component[key].set(inputs[key]);
    }
  });

  return component as T;
}

/**
 * Create a test component without rendering (for unit tests)
 */
export function createTestComponentNoRender<T>(componentClass: any, inputs: Record<string, any> = {}): T {
  return createTestComponent<T>(componentClass, inputs);
}

/**
 * Mock data for tests
 */
export { mockData };
