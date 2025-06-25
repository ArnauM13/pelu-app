import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService, Language } from '../../../core/translation.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'pelu-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-selector">
      <button
        class="language-button"
        (click)="toggleDropdown()"
        [attr.aria-label]="'LANGUAGES.SELECT_LANGUAGE' | translate"
        type="button">
        <span class="flag" *ngIf="currentLanguage?.flagImage; else emojiFlag">
          <img [src]="currentLanguage?.flagImage" [alt]="currentLanguage?.name" class="flag-image">
        </span>
        <ng-template #emojiFlag>
          <span class="flag">{{ currentLanguage?.flag }}</span>
        </ng-template>
        <span class="language-code">{{ currentLanguage?.code?.toUpperCase() }}</span>
        <span class="arrow" [class.open]="isDropdownOpen">▼</span>
      </button>

      <div class="dropdown" [class.open]="isDropdownOpen">
        <button
          *ngFor="let lang of availableLanguages"
          class="language-option"
          [class.active]="lang.code === currentLanguage?.code"
          (click)="selectLanguage(lang.code)"
          type="button">
          <span class="flag" *ngIf="lang.flagImage; else optionEmojiFlag">
            <img [src]="lang.flagImage" [alt]="lang.name" class="flag-image">
          </span>
          <ng-template #optionEmojiFlag>
            <span class="flag">{{ lang.flag }}</span>
          </ng-template>
          <span class="name">{{ lang.name }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
      display: inline-block;
    }

    .language-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .language-button:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .flag {
      font-size: 1.25rem;
    }

    .flag-image {
      width: 1.25rem;
      height: 1.25rem;
      object-fit: cover;
      border-radius: 2px;
    }

    .language-code {
      font-weight: 500;
      color: #374151;
    }

    .arrow {
      font-size: 0.75rem;
      color: #6b7280;
      transition: transform 0.2s ease;
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1000;
      min-width: 150px;
    }

    .dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s ease;
      text-align: left;
      font-size: 0.875rem;
    }

    .language-option:hover {
      background: #f8fafc;
    }

    .language-option.active {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .language-option .flag {
      font-size: 1.125rem;
    }

    .language-option .flag-image {
      width: 1.125rem;
      height: 1.125rem;
      object-fit: cover;
      border-radius: 2px;
    }

    .language-option .name {
      font-weight: 500;
    }

    /* RTL support */
    :host-context([dir="rtl"]) .dropdown {
      right: auto;
      left: 0;
    }

    :host-context([dir="rtl"]) .language-option {
      text-align: right;
    }
  `]
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  isDropdownOpen = false;
  availableLanguages = this.translationService.availableLanguages;
  currentLanguage = this.translationService.getCurrentLanguageInfo();

  constructor() {
    // Subscribe to language changes
    this.translationService.currentLanguage$.subscribe(() => {
      this.currentLanguage = this.translationService.getCurrentLanguageInfo();
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(langCode: string): void {
    this.translationService.setLanguage(langCode);

    // Save user's language preference when they change it
    this.authService.saveCurrentUserLanguage();

    this.isDropdownOpen = false;
  }

  // Close dropdown when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      this.isDropdownOpen = false;
    }
  }
}
