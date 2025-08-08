import { TestBed } from '@angular/core/testing';
import { TranslationService } from './services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

// Mock translate loader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Mock TranslateService
const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.returnValue('translated text'),
  get: jasmine.createSpy('get').and.returnValue(of('translated text')),
  use: jasmine.createSpy('use'),
  addLangs: jasmine.createSpy('addLangs').and.returnValue(undefined),
  getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('ca'),
  setDefaultLang: jasmine.createSpy('setDefaultLang'),
  getLangs: jasmine.createSpy('getLangs').and.returnValue(['ca', 'es', 'en']),
  reloadLang: jasmine.createSpy('reloadLang'),
};

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have currentLanguage computed signal', () => {
    expect(service.currentLanguage).toBeDefined();
    expect(typeof service.currentLanguage).toBe('function');
  });

  it('should have currentLanguageInfo computed signal', () => {
    expect(service.currentLanguageInfo).toBeDefined();
    expect(typeof service.currentLanguageInfo).toBe('function');
  });

  it('should have availableLanguages array', () => {
    expect(service.availableLanguages).toBeDefined();
    expect(Array.isArray(service.availableLanguages)).toBe(true);
    expect(service.availableLanguages.length).toBe(4);
  });

  it('should have Catalan as first language', () => {
    expect(service.availableLanguages[0].code).toBe('ca');
    expect(service.availableLanguages[0].name).toBe('Català');
  });

  it('should have setLanguage method', () => {
    expect(typeof service.setLanguage).toBe('function');
  });

  it('should have getLanguage method', () => {
    expect(typeof service.getLanguage).toBe('function');
  });

  it('should have getCurrentLanguageInfo method', () => {
    expect(typeof service.getCurrentLanguageInfo).toBe('function');
  });

  it('should have isLanguageAvailable method', () => {
    expect(typeof service.isLanguageAvailable).toBe('function');
  });

  it('should have isRTL method', () => {
    expect(typeof service.isRTL).toBe('function');
  });

  it('should have get method', () => {
    expect(typeof service.get).toBe('function');
  });

  it('should have get$ method', () => {
    expect(typeof service.get$).toBe('function');
  });

  it('should have reload method', () => {
    expect(typeof service.reload).toBe('function');
  });

  it('should have getBrowserLanguage method', () => {
    expect(typeof service.getBrowserLanguage).toBe('function');
  });

  it('should have saveUserLanguagePreference method', () => {
    expect(typeof service.saveUserLanguagePreference).toBe('function');
  });

  it('should have getUserLanguagePreference method', () => {
    expect(typeof service.getUserLanguagePreference).toBe('function');
  });

  it('should have restoreUserLanguagePreference method', () => {
    expect(typeof service.restoreUserLanguagePreference).toBe('function');
  });

  it('should initialize with Catalan as default language', () => {
    expect(service.currentLanguage()).toBe('ca');
  });

  it('should return current language info', () => {
    const langInfo = service.currentLanguageInfo();
    expect(langInfo).toBeDefined();
    expect(langInfo?.code).toBe('ca');
    expect(langInfo?.name).toBe('Català');
  });

  it('should check if language is available', () => {
    expect(service.isLanguageAvailable('ca')).toBe(true);
    expect(service.isLanguageAvailable('es')).toBe(true);
    expect(service.isLanguageAvailable('en')).toBe(true);
    expect(service.isLanguageAvailable('ar')).toBe(true);
    expect(service.isLanguageAvailable('fr')).toBe(false);
  });

  it('should check RTL languages', () => {
    expect(service.isRTL('ar')).toBe(true);
    expect(service.isRTL('ca')).toBe(false);
    expect(service.isRTL('es')).toBe(false);
    expect(service.isRTL('en')).toBe(false);
  });

  it('should get translated text', () => {
    const result = service.get('TEST.KEY');
    expect(result).toBe('translated text');
    expect(translateService.instant).toHaveBeenCalledWith('TEST.KEY', undefined);
  });

  it('should get translated text with parameters', () => {
    const params = { name: 'test' };
    service.get('TEST.KEY', params);
    expect(translateService.instant).toHaveBeenCalledWith('TEST.KEY', params);
  });

  it('should get translated text as observable', () => {
    const result = service.get$('TEST.KEY');
    expect(result).toBeDefined();
    expect(translateService.get).toHaveBeenCalledWith('TEST.KEY', undefined);
  });

  it('should reload translations', () => {
    service.reload();
    expect(translateService.reloadLang).toHaveBeenCalledWith('ca');
  });

  it('should get browser language', () => {
    const result = service.getBrowserLanguage();
    expect(result).toBe('ca');
    expect(translateService.getBrowserLang).toHaveBeenCalled();
  });

  it('should save user language preference', () => {
    spyOn(localStorage, 'setItem');
    service.saveUserLanguagePreference('user123', 'es');
    expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage_user123', 'es');
  });

  it('should get user language preference', () => {
    spyOn(localStorage, 'getItem').and.returnValue('en');
    const result = service.getUserLanguagePreference('user123');
    expect(result).toBe('en');
    expect(localStorage.getItem).toHaveBeenCalledWith('userLanguage_user123');
  });

  it('should restore user language preference', () => {
    spyOn(localStorage, 'getItem').and.returnValue('es');
    spyOn(service, 'setLanguage' as unknown as jasmine.Spy);
    service.restoreUserLanguagePreference('user123');
    expect(service.setLanguage).toHaveBeenCalledWith('es');
  });

  it('should not restore invalid language preference', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid');
    spyOn(service, 'setLanguage');
    service.restoreUserLanguagePreference('user123');
    expect(service.setLanguage).not.toHaveBeenCalled();
  });
});
