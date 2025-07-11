import { Component, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService, Language } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'pelu-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  // Internal state signals
  private readonly isDropdownOpenSignal = signal<boolean>(false);
  private readonly currentLanguageSignal = signal<Language | undefined>(undefined);

  // Public computed signals
  readonly isDropdownOpen = computed(() => this.isDropdownOpenSignal());
  readonly currentLanguage = computed(() => this.currentLanguageSignal());
  readonly availableLanguages = this.translationService.availableLanguages;

  constructor() {
    // Initialize current language
    this.currentLanguageSignal.set(this.translationService.getCurrentLanguageInfo());
    // Initialize language effect
    this.#initLanguageEffect();
  }

  ngOnInit() {
    document.addEventListener('click', this.onDocumentClickBound, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClickBound, true);
  }

  // Bound version for add/removeEventListener
  private onDocumentClickBound = (event: Event) => this.onDocumentClick(event);

  #initLanguageEffect() {
    effect(() => {
      this.currentLanguageSignal.set(this.translationService.getCurrentLanguageInfo());
    }, { allowSignalWrites: true });
  }

  toggleDropdown(): void {
    this.isDropdownOpenSignal.update(open => !open);
  }

  selectLanguage(langCode: string): void {
    this.translationService.setLanguage(langCode);
    // Save user's language preference when they change it
    this.authService.saveCurrentUserLanguage();
    this.isDropdownOpenSignal.set(false);
  }

  // Close dropdown when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      if (this.isDropdownOpenSignal()) {
        this.isDropdownOpenSignal.set(false);
      }
    }
  }
}
