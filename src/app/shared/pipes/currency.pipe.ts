import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({
  name: 'currency',
  standalone: true,
})
export class CurrencyPipe implements PipeTransform {
  private readonly currencyService = inject(CurrencyService);

  transform(value: number | string | null | undefined, currencyCode?: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return '';
    }

    if (currencyCode) {
      return this.currencyService.formatPriceWithCurrency(numericValue, currencyCode);
    } else {
      return this.currencyService.formatPrice(numericValue);
    }
  }
}
