import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
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

  it('should have getCurrentLang method', () => {
    expect(service.getCurrentLang).toBeDefined();
    expect(typeof service.getCurrentLang).toBe('function');
  });

  it('should have getAvailableLanguages method', () => {
    expect(service.getAvailableLanguages).toBeDefined();
    expect(typeof service.getAvailableLanguages).toBe('function');
  });

  it('should have availableLanguages array', () => {
    const languages = service.getAvailableLanguages();
    expect(languages).toBeDefined();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBe(3);
  });

  it('should have Catalan as first language', () => {
    const languages = service.getAvailableLanguages();
    expect(languages[0].code).toBe('ca');
    expect(languages[0].name).toBe('Català');
  });

  it('should have setLanguage method', () => {
    expect(typeof service.setLanguage).toBe('function');
  });

  it('should have getTranslation method', () => {
    expect(typeof service.getTranslation).toBe('function');
  });

  it('should have getTranslationInstant method', () => {
    expect(typeof service.getTranslationInstant).toBe('function');
  });

  it('should initialize with Catalan as default language', () => {
    expect(service.getCurrentLang()).toBe('ca');
  });

  it('should get translated text', () => {
    const result = service.getTranslationInstant('TEST.KEY');
    expect(result).toBe('translated text');
    expect(translateService.instant).toHaveBeenCalledWith('TEST.KEY', undefined);
  });

  it('should get translated text with parameters', () => {
    const params = { name: 'test' };
    service.getTranslationInstant('TEST.KEY', params);
    expect(translateService.instant).toHaveBeenCalledWith('TEST.KEY', params);
  });

  it('should get translated text as observable', () => {
    const result = service.getTranslation('TEST.KEY');
    expect(result).toBeDefined();
    expect(translateService.get).toHaveBeenCalledWith('TEST.KEY', undefined);
  });
});
