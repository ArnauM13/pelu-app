import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLang = 'ca';

  private translate = inject(TranslateService);

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    this.translate.setDefaultLang('ca');
    this.translate.addLangs(['ca', 'es', 'en']);

    const browserLang = this.translate.getBrowserLang();
    const savedLang = this.getUserLanguagePreference();

    if (savedLang && this.isLanguageAvailable(savedLang)) {
      this.translate.use(savedLang);
      this.currentLang = savedLang;
    } else if (browserLang && this.isLanguageAvailable(browserLang)) {
      this.translate.use(browserLang);
      this.currentLang = browserLang;
    } else {
      this.translate.use('ca');
      this.currentLang = 'ca';
    }
  }

  getCurrentLang(): string {
    return this.currentLang;
  }

  setLanguage(lang: string): void {
    if (this.isLanguageAvailable(lang)) {
      this.translate.use(lang);
      this.currentLang = lang;
      this.saveUserLanguagePreference(lang);
    }
  }

  getAvailableLanguages(): LanguageInfo[] {
    return [
      { code: 'ca', name: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
    ];
  }

  getTranslation(key: string, params?: Record<string, any>): Observable<string> {
    return this.translate.get(key, params);
  }

  getTranslationInstant(key: string, params?: Record<string, any>): string {
    return this.translate.instant(key, params);
  }

  private isLanguageAvailable(lang: string): boolean {
    return this.translate.getLangs().includes(lang);
  }

  private getUserLanguagePreference(): string | null {
    return localStorage.getItem('userLanguage');
  }

  private saveUserLanguagePreference(lang: string): void {
    localStorage.setItem('userLanguage', lang);
  }
}
