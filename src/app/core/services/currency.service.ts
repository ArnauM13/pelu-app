import { Injectable, signal, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrency = signal<string>('EUR');

  // Currency information mapping
  private readonly currencies: Record<string, CurrencyInfo> = {
    'EUR': { code: 'EUR', symbol: '€', name: 'Euro', position: 'after', decimalPlaces: 2 },
    'USD': { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before', decimalPlaces: 2 },
    'GBP': { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before', decimalPlaces: 2 },
    'CHF': { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', position: 'before', decimalPlaces: 2 },
    'SEK': { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona', position: 'after', decimalPlaces: 2 },
    'NOK': { code: 'NOK', symbol: 'NOK', name: 'Norwegian Krone', position: 'after', decimalPlaces: 2 },
    'DKK': { code: 'DKK', symbol: 'DKK', name: 'Danish Krone', position: 'after', decimalPlaces: 2 },
    'PLN': { code: 'PLN', symbol: 'PLN', name: 'Polish Złoty', position: 'after', decimalPlaces: 2 },
    'HUF': { code: 'HUF', symbol: 'HUF', name: 'Hungarian Forint', position: 'after', decimalPlaces: 0 },
    'RON': { code: 'RON', symbol: 'RON', name: 'Romanian Leu', position: 'after', decimalPlaces: 2 },
    'BGN': { code: 'BGN', symbol: 'BGN', name: 'Bulgarian Lev', position: 'after', decimalPlaces: 2 },
    'HRK': { code: 'HRK', symbol: 'HRK', name: 'Croatian Kuna', position: 'after', decimalPlaces: 2 },
    'MAD': { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', position: 'after', decimalPlaces: 2 },
    'DZD': { code: 'DZD', symbol: 'DZD', name: 'Algerian Dinar', position: 'after', decimalPlaces: 2 },
    'TND': { code: 'TND', symbol: 'TND', name: 'Tunisian Dinar', position: 'after', decimalPlaces: 3 },
    'EGP': { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound', position: 'after', decimalPlaces: 2 }
  };

  constructor(private translateService: TranslateService) {
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
  getCurrencyInfo(currencyCode: string): CurrencyInfo | null {
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
      value: currency.code
    }));
  }

  // Reset to default currency
  resetToDefault() {
    this.setCurrentCurrency('EUR');
  }
}
