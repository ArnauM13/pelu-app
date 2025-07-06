import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSelectorComponent } from './language-selector.component';
import { TranslationService, Language } from '../../../core/translation.service';
import { AuthService } from '../../../auth/auth.service';
import { mockAuthService } from '../../../../testing/firebase-mocks';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;
  let mockAuthServiceInstance: jasmine.SpyObj<AuthService>;

  const mockLanguage: Language = {
    code: 'ca',
    name: 'Català',
    flag: '🇪🇸'
  };

  const mockAvailableLanguages: Language[] = [
    { code: 'ca', name: 'Català', flag: '🇪🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  beforeEach(async () => {
    mockTranslationService = jasmine.createSpyObj('TranslationService', [
      'getCurrentLanguageInfo',
      'setLanguage'
    ], {
      availableLanguages: mockAvailableLanguages
    });

    mockAuthServiceInstance = mockAuthService;

    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthServiceInstance }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject TranslationService and AuthService', () => {
    expect(component['translationService']).toBeDefined();
    expect(component['authService']).toBeDefined();
    expect(component['translationService']).toBe(mockTranslationService);
    expect(component['authService']).toBe(mockAuthServiceInstance);
  });

  it('should have isDropdownOpen computed property', () => {
    expect(component.isDropdownOpen).toBeDefined();
    expect(typeof component.isDropdownOpen).toBe('function');
  });

  it('should have currentLanguage computed property', () => {
    expect(component.currentLanguage).toBeDefined();
    expect(typeof component.currentLanguage).toBe('function');
  });

  it('should have availableLanguages computed property', () => {
    expect(component.availableLanguages).toBeDefined();
    expect(component.availableLanguages).toBe(mockAvailableLanguages);
  });

  it('should initialize current language on construction', () => {
    mockTranslationService.getCurrentLanguageInfo.and.returnValue(mockLanguage);

    // Recreate component to trigger constructor
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;

    expect(mockTranslationService.getCurrentLanguageInfo).toHaveBeenCalled();
  });

  it('should toggle dropdown when toggleDropdown is called', () => {
    // Initially closed
    expect(component.isDropdownOpen()).toBe(false);

    // Toggle to open
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Toggle to close
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should select language and close dropdown when selectLanguage is called', () => {
    // Open dropdown first
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Select language
    component.selectLanguage('es');

    expect(mockTranslationService.setLanguage).toHaveBeenCalledWith('es');
    expect(mockAuthServiceInstance.saveCurrentUserLanguage).toHaveBeenCalled();
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should close dropdown when clicking outside', () => {
    // Open dropdown first
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Create mock event with target outside language selector
    const mockEvent = new Event('click');
    const mockTarget = document.createElement('div');
    Object.defineProperty(mockEvent, 'target', { value: mockTarget });

    // Mock closest method to return null (outside selector)
    spyOn(mockTarget, 'closest').and.returnValue(null);

    component.onDocumentClick(mockEvent);

    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should not close dropdown when clicking inside', () => {
    // Open dropdown first
    component.toggleDropdown();
    expect(component.isDropdownOpen()).toBe(true);

    // Create mock event with target inside language selector
    const mockEvent = new Event('click');
    const mockTarget = document.createElement('div');
    const mockSelector = document.createElement('div');
    mockSelector.className = 'language-selector';

    Object.defineProperty(mockEvent, 'target', { value: mockTarget });

    // Mock closest method to return the selector element (inside selector)
    spyOn(mockTarget, 'closest').and.returnValue(mockSelector);

    component.onDocumentClick(mockEvent);

    expect(component.isDropdownOpen()).toBe(true);
  });

  it('should have toggleDropdown method', () => {
    expect(typeof component.toggleDropdown).toBe('function');
  });

  it('should have selectLanguage method', () => {
    expect(typeof component.selectLanguage).toBe('function');
  });

  it('should have onDocumentClick method', () => {
    expect(typeof component.onDocumentClick).toBe('function');
  });

  it('should render language selector element', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const selectorElement = compiled.querySelector('.language-selector');
    expect(selectorElement).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(LanguageSelectorComponent.prototype.constructor.name).toBe('LanguageSelectorComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = LanguageSelectorComponent;
    expect(componentClass.name).toBe('LanguageSelectorComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(LanguageSelectorComponent.prototype).toBeDefined();
    expect(LanguageSelectorComponent.prototype.constructor).toBeDefined();
  });

  it('should handle different language codes', () => {
    component.selectLanguage('en');
    expect(mockTranslationService.setLanguage).toHaveBeenCalledWith('en');

    component.selectLanguage('es');
    expect(mockTranslationService.setLanguage).toHaveBeenCalledWith('es');

    component.selectLanguage('ca');
    expect(mockTranslationService.setLanguage).toHaveBeenCalledWith('ca');
  });

  it('should initialize with correct current language', () => {
    mockTranslationService.getCurrentLanguageInfo.and.returnValue(mockLanguage);

    // Recreate component to trigger constructor
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;

    expect(component.currentLanguage()).toEqual(mockLanguage);
  });

  it('should handle undefined current language gracefully', () => {
    mockTranslationService.getCurrentLanguageInfo.and.returnValue(undefined);

    // Recreate component to trigger constructor
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;

    expect(component.currentLanguage()).toBeUndefined();
  });
});
