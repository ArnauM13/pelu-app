import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag?: string;
  flagImage?: string;
  rtl?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>('ca');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  readonly availableLanguages: Language[] = [
    { code: 'ca', name: 'Català', flagImage: '/assets/images/ca.png' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true }
  ];

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Set available languages
    this.translate.addLangs(this.availableLanguages.map(lang => lang.code));

    // Get saved language or browser language
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = this.translate.getBrowserLang();

    // Determine initial language
    let initialLanguage = 'ca'; // Default

    if (savedLanguage && this.isLanguageAvailable(savedLanguage)) {
      initialLanguage = savedLanguage;
    } else if (browserLanguage && this.isLanguageAvailable(browserLanguage)) {
      initialLanguage = browserLanguage;
    }

    this.setLanguage(initialLanguage);
  }

  setLanguage(lang: string): void {
    if (!this.isLanguageAvailable(lang)) {
      console.warn(`Language ${lang} is not available`);
      return;
    }

    // Update translate service
    this.translate.use(lang);

    // Update current language subject
    this.currentLanguageSubject.next(lang);

    // Save to localStorage
    localStorage.setItem('preferredLanguage', lang);

    // Update document attributes
    this.updateDocumentAttributes(lang);
  }

  getLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  getCurrentLanguageInfo(): Language | undefined {
    const currentLang = this.getLanguage();
    return this.availableLanguages.find(lang => lang.code === currentLang);
  }

  isLanguageAvailable(lang: string): boolean {
    return this.availableLanguages.some(language => language.code === lang);
  }

  isRTL(lang?: string): boolean {
    const languageCode = lang || this.getLanguage();
    const languageInfo = this.availableLanguages.find(l => l.code === languageCode);
    return languageInfo?.rtl || false;
  }

  private updateDocumentAttributes(lang: string): void {
    // Set language attribute
    document.documentElement.lang = lang;

    // Set direction attribute for RTL support
    const isRTL = this.isRTL(lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    // Add/remove RTL class for styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }

  // Helper method to get translated text
  get(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  // Helper method to get translated text as observable
  get$(key: string, params?: any) {
    return this.translate.get(key, params);
  }

  // Method to reload translations (useful for dynamic content)
  reload(): void {
    this.translate.reloadLang(this.getLanguage());
  }
}
