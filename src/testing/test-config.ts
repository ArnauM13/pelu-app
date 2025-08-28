import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { routes } from '../app/app.routes';
import { firestoreMock, mockLoggerService } from './firebase-mocks';
import { LoggerService } from '../app/shared/services/logger.service';

// Test configuration that provides mocked Firebase services
export const testConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    providePrimeNG({ theme: { preset: Aura }}),
    provideAnimationsAsync(),
    MessageService,
    ConfirmationService,
    provideRouter(routes),

    // Mock Firebase services
    { provide: 'Firestore', useValue: firestoreMock },
    { provide: LoggerService, useValue: mockLoggerService },

    // Import modules
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
  ],
};
