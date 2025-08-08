import { Injectable, signal, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  code: string;
  name: string;
  flag?: string;
  flagImage?: string;
  rtl?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly currentLanguageSignal = signal<string>('ca');

  // Computed signals
  readonly currentLanguage = computed(() => this.currentLanguageSignal());
  readonly currentLanguageInfo = computed(() => {
    return this.availableLanguages.find(lang => lang.code === this.currentLanguage());
  });

  readonly availableLanguages: Language[] = [
    { code: 'ca', name: 'Català', flag: '🇪🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  ];

  private translate = inject(TranslateService);

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const initialLanguage = savedLanguage || this.translate.getBrowserLang() || 'ca';
    this.setLanguage(initialLanguage, false);
  }

  setLanguage(lang: string, saveToStorage: boolean = true): void {
    if (!this.isLanguageAvailable(lang)) {
      return;
    }

    // Update translate service
    this.translate.use(lang);

    // Update current language signal
    this.currentLanguageSignal.set(lang);

    // Save to localStorage only if requested
    if (saveToStorage) {
      localStorage.setItem('preferredLanguage', lang);
    }

    // Update document attributes
    this.updateDocumentAttributes(lang);
  }

  getLanguage(): string {
    return this.currentLanguage();
  }

  getCurrentLanguageInfo(): Language | undefined {
    return this.currentLanguageInfo();
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
  get(key: string, params?: Record<string, string | number>): string {
    return this.translate.instant(key, params);
  }

  // Helper method to get translated text as observable
  get$(key: string, params?: Record<string, string | number>) {
    return this.translate.get(key, params);
  }

  // Method to reload translations (useful for dynamic content)
  reload(): void {
    this.translate.reloadLang(this.getLanguage());
  }

  // Method to get browser language
  getBrowserLanguage(): string | undefined {
    return this.translate.getBrowserLang();
  }

  // Method to save user's language preference
  saveUserLanguagePreference(userId: string, language: string): void {
    if (this.isLanguageAvailable(language)) {
      const userLanguageKey = `userLanguage_${userId}`;
      localStorage.setItem(userLanguageKey, language);
    }
  }

  // Method to get user's saved language preference
  getUserLanguagePreference(userId: string): string | null {
    const userLanguageKey = `userLanguage_${userId}`;
    return localStorage.getItem(userLanguageKey);
  }

  // Method to restore user's language preference
  restoreUserLanguagePreference(userId: string): void {
    const savedLanguage = this.getUserLanguagePreference(userId);
    if (savedLanguage && this.isLanguageAvailable(savedLanguage)) {
      this.setLanguage(savedLanguage);
    }
  }
}
