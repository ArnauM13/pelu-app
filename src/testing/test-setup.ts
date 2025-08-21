import { TestBed } from '@angular/core/testing';
import { ServiceColorsService } from '../app/core/services/service-colors.service';
import { ServicesService } from '../app/core/services/services.service';
import { RoleService } from '../app/core/services/role.service';
import { UserService } from '../app/core/services/user.service';
import { CurrencyService } from '../app/core/services/currency.service';
import { ToastService } from '../app/shared/services/toast.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import {
  provideMockFirebase,
} from './firebase-mocks';

// Mock classes per a serveis que depenen de Firebase/AngularFire
class MockRoleService {
  userRole = { subscribe: () => ({ unsubscribe: () => {} }) };
  isAdmin() {
    return false;
  }
  isClient() {
    return true;
  }
  initializeRoleListener() {}
}

class MockUserService {
  currentUser = { subscribe: () => ({ unsubscribe: () => {} }) };
  getUser() {
    return Promise.resolve({ uid: 'test-uid', email: 'test@example.com' });
  }
}

class MockServicesService {
  getAllServices() {
    return Promise.resolve([]);
  }
  getServiceName(service: unknown) {
    return (service as { name?: string })?.name || 'Unknown Service';
  }
}

class MockCurrencyService {
  getCurrentCurrency() {
    return 'EUR';
  }
  formatPrice(price: number) {
    return `${price}€`;
  }
}

class MockServiceColorsService {
  getServiceColor() {
    return {
      id: 'default',
      translationKey: 'SERVICES.COLORS.DEFAULT',
      color: '#000000',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      textColor: '#000000',
    };
  }
  getServiceColorClass() {
    return 'primary';
  }
  getServiceIcon() {
    return 'scissors';
  }
  getServiceTranslation() {
    return 'Mocked Service';
  }
}

/**
 * Configure TestBed with common providers for all tests
 */
export function configureTestBed(components: unknown[] = [], additionalProviders: unknown[] = []) {
  const allProviders = [
    ...provideMockFirebase(),
    { provide: ServiceColorsService, useClass: MockServiceColorsService },
    { provide: ServicesService, useClass: MockServicesService },
    { provide: RoleService, useClass: MockRoleService },
    { provide: UserService, useClass: MockUserService },
    { provide: CurrencyService, useClass: MockCurrencyService },
    { provide: ToastService, useValue: { showAppointmentCreated: () => {} } },
    ...additionalProviders,
  ];

  return TestBed.configureTestingModule({
    imports: components,
    providers: allProviders,
  });
}

/**
 * Reset all mocks to their initial state
 */
export function resetMocks() {
  // Mock reset function - no actual mocks to reset in this setup
}

/**
 * Set up default mock return values
 */
export function setupDefaultMocks() {
  // Mock setup function - no actual mocks to set up in this configuration
}

/**
 * Create a test component with input signals
 */
export function createTestComponent<T>(componentClass: unknown, inputs: Record<string, unknown> = {}): T {
  const component = TestBed.createComponent(componentClass as { new (): unknown }).componentInstance as Record<string, unknown>;

  // Set input signals
  Object.keys(inputs).forEach(key => {
    const componentKey = component[key];
    if (componentKey && typeof componentKey === 'object' && 'set' in componentKey && typeof (componentKey as { set: unknown }).set === 'function') {
      (componentKey as { set: (value: unknown) => void }).set(inputs[key]);
    }
  });

  return component as T;
}

/**
 * Create a test component without rendering (for unit tests)
 */
export function createTestComponentNoRender<T>(
  componentClass: unknown,
  inputs: Record<string, unknown> = {}
): T {
  return createTestComponent<T>(componentClass, inputs);
}

/**
 * Mock data for tests
 */
export const mockData = {
  appointments: [
    {
      id: '1',
      nom: 'Joan Garcia',
      data: '2024-01-15',
      hora: '10:00',
      servei: 'Tall de cabell',
      serviceName: 'Tall de cabell',
      duration: 30,
      clientId: 'client-1',
    },
    {
      id: '2',
      nom: 'Maria Lopez',
      data: '2024-01-15',
      hora: '11:00',
      servei: 'Coloració',
      serviceName: 'Coloració',
      duration: 60,
      clientId: 'client-2',
    },
  ],
  services: [
    {
      id: '1',
      name: 'Tall de cabell',
      duration: 30,
      price: 25,
      description: 'Tall de cabell bàsic',
    },
    {
      id: '2',
      name: 'Coloració',
      duration: 60,
      price: 45,
      description: 'Coloració completa',
    },
  ],
};

// Configuració global per als tests
export function setupTestEnvironment() {
  const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  TestBed.configureTestingModule({
    providers: [
      ...provideMockFirebase(),
      { provide: MessageService, useValue: messageServiceSpy },
      { provide: Router, useValue: routerSpy },
      { provide: ServiceColorsService, useClass: MockServiceColorsService },
      { provide: RoleService, useClass: MockRoleService },
      { provide: UserService, useClass: MockUserService },
      { provide: ServicesService, useClass: MockServicesService },
      { provide: CurrencyService, useClass: MockCurrencyService },
      { provide: ToastService, useValue: { showAppointmentCreated: () => {} } },
    ],
  });

  return {
    messageService: messageServiceSpy,
    router: routerSpy,
  };
}

// Funció per configurar tests individuals
export function configureTestModule(additionalProviders: unknown[] = []) {
  const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  const baseProviders = [
    ...provideMockFirebase(),
    { provide: MessageService, useValue: messageServiceSpy },
    { provide: Router, useValue: routerSpy },
    { provide: ServiceColorsService, useClass: MockServiceColorsService },
    { provide: RoleService, useClass: MockRoleService },
    { provide: UserService, useClass: MockUserService },
    { provide: ServicesService, useClass: MockServicesService },
    { provide: CurrencyService, useClass: MockCurrencyService },
    { provide: ToastService, useValue: { showAppointmentCreated: () => {} } },
  ];

  return {
    providers: [...baseProviders, ...additionalProviders],
    messageService: messageServiceSpy,
    router: routerSpy,
  };
}
