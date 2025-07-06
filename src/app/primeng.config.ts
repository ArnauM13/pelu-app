import { providePrimeNG } from 'primeng/config';
import '@primeng/themes/lara';

export const primengConfig = providePrimeNG({
  theme: 'lara-light-blue' as any,
  ripple: true,
  inputStyle: 'outlined'
});
