import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { LanguageSelectorComponent } from './language-selector.component';
import { TranslationService } from '../../../core/translation.service';
import { AuthService } from '../../../auth/auth.service';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockTranslationService = jasmine.createSpyObj('TranslationService', [
      'getCurrentLanguageInfo',
      'setLanguage'
    ], {
      availableLanguages: [
        { code: 'ca', name: 'Català', flag: '🇨🇦' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' }
      ]
    });

    mockAuthService = jasmine.createSpyObj('AuthService', ['saveCurrentUserLanguage']);

    await TestBed.configureTestingModule({
      imports: [
        LanguageSelectorComponent,
        TranslateModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService },
        HttpClient
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have computed signals defined', () => {
    expect(component.isDropdownOpen).toBeDefined();
    expect(component.currentLanguage).toBeDefined();
    expect(component.availableLanguages).toBeDefined();
  });

  it('should initialize with dropdown closed', () => {
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should initialize current language from translation service', () => {
    const mockLanguage = { code: 'ca', name: 'Català', flag: '🇨🇦' };
    mockTranslationService.getCurrentLanguageInfo.and.returnValue(mockLanguage);

    // Recreate component to trigger initialization
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;

    expect(mockTranslationService.getCurrentLanguageInfo).toHaveBeenCalled();
    expect(component.currentLanguage()).toEqual(mockLanguage);
  });

  it('should have available languages from translation service', () => {
    expect(component.availableLanguages).toEqual([
      { code: 'ca', name: 'Català', flag: '🇨🇦' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ]);
  });

  it('should toggle dropdown when toggleDropdown is called', () => {
    expect(component.isDropdownOpen()).toBe(false);

    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should select language and close dropdown', () => {
    const langCode = 'es';

    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    component.selectLanguage(langCode);

    expect(mockTranslationService.setLanguage).toHaveBeenCalledWith(langCode);
    expect(mockAuthService.saveCurrentUserLanguage).toHaveBeenCalled();
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should close dropdown when clicking outside', () => {
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Simulate click outside
    const mockEvent = {
      target: document.createElement('div')
    } as unknown as Event;

    component.onDocumentClick(mockEvent);
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should not close dropdown when clicking inside', () => {
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Create a mock element with the language-selector class
    const mockElement = document.createElement('div');
    mockElement.className = 'language-selector';
    const mockEvent = {
      target: mockElement
    } as unknown as Event;

    component.onDocumentClick(mockEvent);
    expect(component.isDropdownOpen()).toBe(true);
  });

  it('should not close dropdown when clicking on child of language-selector', () => {
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Create a mock element that is a child of language-selector
    const mockParent = document.createElement('div');
    mockParent.className = 'language-selector';
    const mockChild = document.createElement('span');
    mockParent.appendChild(mockChild);

    const mockEvent = {
      target: mockChild
    } as unknown as Event;

    component.onDocumentClick(mockEvent);
    expect(component.isDropdownOpen()).toBe(true);
  });

  it('should have event handler methods defined', () => {
    expect(typeof component.toggleDropdown).toBe('function');
    expect(typeof component.selectLanguage).toBe('function');
    expect(typeof component.onDocumentClick).toBe('function');
  });
});
