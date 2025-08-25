import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  translationKey: string;
  position: 'before' | 'after';
  decimalPlaces: number;
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  // Inject services
  #translateService = inject(TranslateService);

  private currentCurrency = signal<string>('EUR');

  // Currency information mapping
  private readonly currencies: Record<string, Currency> = {
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      translationKey: 'currency.eur',
      position: 'after',
      decimalPlaces: 2,
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      translationKey: 'currency.usd',
      position: 'before',
      decimalPlaces: 2,
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      translationKey: 'currency.gbp',
      position: 'before',
      decimalPlaces: 2,
    },
    CHF: {
      code: 'CHF',
      symbol: 'CHF',
      name: 'Swiss Franc',
      translationKey: 'currency.chf',
      position: 'before',
      decimalPlaces: 2,
    },
    SEK: {
      code: 'SEK',
      symbol: 'SEK',
      name: 'Swedish Krona',
      translationKey: 'currency.sek',
      position: 'after',
      decimalPlaces: 2,
    },
    NOK: {
      code: 'NOK',
      symbol: 'NOK',
      name: 'Norwegian Krone',
      translationKey: 'currency.nok',
      position: 'after',
      decimalPlaces: 2,
    },
    DKK: {
      code: 'DKK',
      symbol: 'DKK',
      name: 'Danish Krone',
      translationKey: 'currency.dkk',
      position: 'after',
      decimalPlaces: 2,
    },
    PLN: {
      code: 'PLN',
      symbol: 'PLN',
      name: 'Polish Złoty',
      translationKey: 'currency.pln',
      position: 'after',
      decimalPlaces: 2,
    },
    HUF: {
      code: 'HUF',
      symbol: 'HUF',
      name: 'Hungarian Forint',
      translationKey: 'currency.huf',
      position: 'after',
      decimalPlaces: 0,
    },
    RON: {
      code: 'RON',
      symbol: 'RON',
      name: 'Romanian Leu',
      translationKey: 'currency.ron',
      position: 'after',
      decimalPlaces: 2,
    },
    BGN: {
      code: 'BGN',
      symbol: 'BGN',
      name: 'Bulgarian Lev',
      translationKey: 'currency.bgn',
      position: 'after',
      decimalPlaces: 2,
    },
    HRK: {
      code: 'HRK',
      symbol: 'HRK',
      name: 'Croatian Kuna',
      translationKey: 'currency.hrk',
      position: 'after',
      decimalPlaces: 2,
    },
    MAD: {
      code: 'MAD',
      symbol: 'MAD',
      name: 'Moroccan Dirham',
      translationKey: 'currency.mad',
      position: 'after',
      decimalPlaces: 2,
    },
    DZD: {
      code: 'DZD',
      symbol: 'DZD',
      name: 'Algerian Dinar',
      translationKey: 'currency.dzd',
      position: 'after',
      decimalPlaces: 2,
    },
    TND: {
      code: 'TND',
      symbol: 'TND',
      name: 'Tunisian Dinar',
      translationKey: 'currency.tnd',
      position: 'after',
      decimalPlaces: 3,
    },
    EGP: {
      code: 'EGP',
      symbol: 'EGP',
      name: 'Egyptian Pound',
      translationKey: 'currency.egp',
      position: 'after',
      decimalPlaces: 2,
    },
  };

  constructor() {
    // Load currency from localStorage or use default
    const savedCurrency = localStorage.getItem('app_currency');
    if (savedCurrency && this.currencies[savedCurrency]) {
      this.currentCurrency.set(savedCurrency);
    }
  }

  // Get current currency
  getCurrentCurrency() {
    return this.currentCurrency();
  }

  // Set current currency
  setCurrentCurrency(currencyCode: string) {
    if (this.currencies[currencyCode]) {
      this.currentCurrency.set(currencyCode);
      localStorage.setItem('app_currency', currencyCode);
    }
  }

  // Get current currency info
  getCurrentCurrencyInfo() {
    return this.currencies[this.currentCurrency()];
  }

  // Get currency info by code
  getCurrencyInfo(currencyCode: string): Currency | null {
    return this.currencies[currencyCode] || null;
  }

  // Get all available currencies
  getAvailableCurrencies() {
    return Object.values(this.currencies);
  }

  // Format price with current currency
  formatPrice(amount: number): string {
    const currencyInfo = this.getCurrentCurrencyInfo();
    if (!currencyInfo) return amount.toString();

    const formattedAmount = amount.toFixed(currencyInfo.decimalPlaces);

    if (currencyInfo.position === 'before') {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  }

  // Format price with specific currency
  formatPriceWithCurrency(amount: number, currencyCode: string): string {
    const currencyInfo = this.getCurrencyInfo(currencyCode);
    if (!currencyInfo) return amount.toString();

    const formattedAmount = amount.toFixed(currencyInfo.decimalPlaces);

    if (currencyInfo.position === 'before') {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  }

  // Get currency symbol for current currency
  getCurrencySymbol(): string {
    const currencyInfo = this.getCurrentCurrencyInfo();
    return currencyInfo?.symbol || '€';
  }

  // Get currency symbol for specific currency
  getCurrencySymbolFor(currencyCode: string): string {
    const currencyInfo = this.getCurrencyInfo(currencyCode);
    return currencyInfo?.symbol || '€';
  }

  // Get currency name for current currency
  getCurrencyName(): string {
    const currencyInfo = this.getCurrentCurrencyInfo();
    return currencyInfo?.name || 'Euro';
  }

  // Get currency name for specific currency
  getCurrencyNameFor(currencyCode: string): string {
    const currencyInfo = this.getCurrencyInfo(currencyCode);
    return currencyInfo?.name || 'Euro';
  }

  // Get currency options for dropdown (with translations)
  getCurrencyOptions() {
    return Object.values(this.currencies).map(currency => ({
      label: `${currency.name} (${currency.symbol})`,
      value: currency.code,
    }));
  }

  // Reset to default currency
  resetToDefault() {
    this.setCurrentCurrency('EUR');
  }
}
