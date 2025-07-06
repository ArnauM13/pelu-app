import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { TranslationService } from '../app/core/translation.service';
import { of } from 'rxjs';
import { computed } from '@angular/core';

// Enhanced mock for TranslateService that properly handles the pipe
export const createMockTranslateService = () => {
  const mockService = jasmine.createSpyObj('TranslateService', [
    'addLangs',
    'use',
    'getBrowserLang',
    'instant',
    'get',
    'reloadLang',
    'setDefaultLang',
    'getCurrentLang',
    'onLangChange',
    'onTranslationChange',
    'onDefaultLangChange'
  ]);

  // Mock the instant method to return the key if no translation is found
  mockService.instant.and.callFake((key: string) => {
    // Return the key itself as a fallback
    return key;
  });

  // Mock the get method to return an observable with the key
  mockService.get.and.callFake((key: string) => {
    return of(key);
  });

  // Mock other methods
  mockService.addLangs.and.returnValue(undefined);
  mockService.use.and.returnValue(of(undefined));
  mockService.getBrowserLang.and.returnValue('ca');
  mockService.reloadLang.and.returnValue(of(undefined));
  mockService.setDefaultLang.and.returnValue(undefined);
  mockService.getCurrentLang.and.returnValue('ca');

  // Mock observables
  mockService.onLangChange = of({ lang: 'ca', translations: {} });
  mockService.onTranslationChange = of({ lang: 'ca', translations: {} });
  mockService.onDefaultLangChange = of({ lang: 'ca', translations: {} });

  return mockService;
};

// Enhanced mock for TranslateStore
export const createMockTranslateStore = () => {
  const mockStore = jasmine.createSpyObj('TranslateStore', [
    'onLangChange',
    'onDefaultLangChange',
    'onTranslationChange'
  ]);

  mockStore.onLangChange = of({ lang: 'ca', translations: {} });
  mockStore.onDefaultLangChange = of({ lang: 'ca', translations: {} });
  mockStore.onTranslationChange = of({ lang: 'ca', translations: {} });

  return mockStore;
};

// Enhanced mock for TranslationService
export const createMockTranslationService = () => {
  const mockService = jasmine.createSpyObj('TranslationService', [
    'setLanguage',
    'getLanguage',
    'getCurrentLanguageInfo',
    'isLanguageAvailable',
    'isRTL',
    'get',
    'get$',
    'reload',
    'getBrowserLanguage',
    'saveUserLanguagePreference',
    'getUserLanguagePreference',
    'restoreUserLanguagePreference'
  ]);

  // Mock methods
  mockService.setLanguage.and.returnValue(undefined);
  mockService.getLanguage.and.returnValue('ca');
  mockService.getCurrentLanguageInfo.and.returnValue({ code: 'ca', name: 'Català' });
  mockService.isLanguageAvailable.and.returnValue(true);
  mockService.isRTL.and.returnValue(false);
  mockService.get.and.callFake((key: string) => key);
  mockService.get$.and.callFake((key: string) => of(key));
  mockService.reload.and.returnValue(undefined);
  mockService.getBrowserLanguage.and.returnValue('ca');
  mockService.saveUserLanguagePreference.and.returnValue(undefined);
  mockService.getUserLanguagePreference.and.returnValue('ca');
  mockService.restoreUserLanguagePreference.and.returnValue(undefined);

  // Mock signals
  mockService.currentLanguage = computed(() => 'ca');
  mockService.currentLanguageInfo = computed(() => ({ code: 'ca', name: 'Català' }));
  mockService.availableLanguages = [
    { code: 'ca', name: 'Català', flagImage: '/assets/images/ca.png' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true }
  ];

  return mockService;
};

// Translation test utilities
export const translationTestUtils = {
  // Mock translation keys for testing
  mockTranslationKeys: {
    'COMMON.TOTAL_APPOINTMENTS': 'Total de cites',
    'COMMON.TODAY_APPOINTMENTS': 'Cites d\'avui',
    'COMMON.UPCOMING_APPOINTMENTS': 'Cites properes',
    'COMMON.MY_APPOINTMENTS': 'Les meves cites',
    'COMMON.APPOINTMENTS_CALENDAR': 'Calendari de cites',
    'COMMON.VIEW_APPOINTMENTS': 'Veure cites',
    'COMMON.APPOINTMENTS_FOR_DATE': 'Cites per a la data',
    'COMMON.NO_SCHEDULED_APPOINTMENTS': 'No hi ha cites programades',
    'COMMON.NO_APPOINTMENTS_MESSAGE': 'No hi ha cites programades per a aquesta data',
    'COMMON.APPOINTMENTS_LIST': 'Llista de cites',
    'COMMON.NO_APPOINTMENTS': 'No hi ha cites',
    'COMMON.NO_APPOINTMENTS_FILTERED': 'No hi ha cites que coincideixin amb els filtres',
    'COMMON.NO_APPOINTMENTS_SCHEDULED': 'No hi ha cites programades',
    'COMMON.CLEAR_FILTERS': 'Netejar filtres',
    'COMMON.TODAY': 'Avui',
    'COMMON.PAST': 'Passat',
    'COMMON.UPCOMING': 'Proper',
    'COMMON.CLICK_TO_VIEW': 'Clic per veure',
    'COMMON.DELETE_CONFIRMATION': 'Confirmar eliminació',
    'COMMON.CHANGE_VIEW': 'Canviar vista',
    'COMMON.FILTER_BY_DATE': 'Filtrar per data:',
    'COMMON.FILTER_BY_CLIENT': 'Filtrar per client:',
    'COMMON.CLEAR_FILTERS_BUTTON': '🗑️ Netejar filtres',
    'LANDING.SERVICES': 'Serveis',
    'LANDING.PROFILE': 'Perfil',
    'LANDING.BOOK_NOW': 'Reservar',
    'LANDING.APPOINTMENTS': 'Cites',
    'LANDING.HERO_SUBTITLE': 'Reserva el teu moment',
    'COMMON.APP_NAME': 'PeluApp',
    'COMMON.ALL_RIGHTS_RESERVED': 'Tots els drets reservats'
  } as Record<string, string>,

  // Create a mock service that returns actual translations
  createRealisticTranslateService: () => {
    const mockService = createMockTranslateService();

    mockService.instant.and.callFake((key: string) => {
      return translationTestUtils.mockTranslationKeys[key] || key;
    });

    mockService.get.and.callFake((key: string) => {
      return of(translationTestUtils.mockTranslationKeys[key] || key);
    });

    return mockService;
  },

  // Create a mock service that returns actual translations
  createRealisticTranslationService: () => {
    const mockService = createMockTranslationService();

    mockService.get.and.callFake((key: string) => {
      return translationTestUtils.mockTranslationKeys[key] || key;
    });

    mockService.get$.and.callFake((key: string) => {
      return of(translationTestUtils.mockTranslationKeys[key] || key);
    });

    return mockService;
  }
};

// Export the enhanced mocks
export const mockTranslateService = createMockTranslateService();
export const mockTranslateStore = createMockTranslateStore();
export const mockTranslationService = createMockTranslationService();
