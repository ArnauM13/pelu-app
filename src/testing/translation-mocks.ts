import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

// Mock TranslateService
export const mockTranslateService = {
  instant: jasmine.createSpy('instant').and.returnValue('Mocked Translation'),
  get: jasmine.createSpy('get').and.returnValue(of('Mocked Translation')),
  use: jasmine.createSpy('use').and.returnValue(of('Mocked Translation')),
  addLangs: jasmine.createSpy('addLangs'),
  getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('ca'),
  reloadLang: jasmine.createSpy('reloadLang').and.returnValue(of({})),
  setDefaultLang: jasmine.createSpy('setDefaultLang'),
  getDefaultLang: jasmine.createSpy('getDefaultLang').and.returnValue('ca'),
  getLangs: jasmine.createSpy('getLangs').and.returnValue(['ca', 'es', 'en']),
  onLangChange: new EventEmitter(),
  onDefaultLangChange: new EventEmitter(),
  onTranslationChange: new EventEmitter()
};

// Mock TranslateStore
export const mockTranslateStore = {
  onLangChange: new EventEmitter(),
  onDefaultLangChange: new EventEmitter(),
  onTranslationChange: new EventEmitter()
};

// Mock TranslationService
export const mockTranslationService = {
  get: jasmine.createSpy('get').and.returnValue('Mocked Translation'),
  get$: jasmine.createSpy('get$').and.returnValue(of('Mocked Translation')),
  setLanguage: jasmine.createSpy('setLanguage'),
  getLanguage: jasmine.createSpy('getLanguage').and.returnValue('ca'),
  getCurrentLanguageInfo: jasmine.createSpy('getCurrentLanguageInfo').and.returnValue({
    code: 'ca',
    name: 'Català',
    flag: '🏴󠁥󠁳󠁣󠁴󠁿'
  }),
  isLanguageAvailable: jasmine.createSpy('isLanguageAvailable').and.returnValue(true),
  isRTL: jasmine.createSpy('isRTL').and.returnValue(false),
  reload: jasmine.createSpy('reload'),
  getBrowserLanguage: jasmine.createSpy('getBrowserLanguage').and.returnValue('ca'),
  saveUserLanguagePreference: jasmine.createSpy('saveUserLanguagePreference'),
  getUserLanguagePreference: jasmine.createSpy('getUserLanguagePreference').and.returnValue('ca'),
  initializeLanguage: jasmine.createSpy('initializeLanguage')
};

// Mock ServiceColorsService
export const mockServiceColorsService = {
  getServiceColor: jasmine.createSpy('getServiceColor').and.returnValue('#007bff'),
  getServiceColorClass: jasmine.createSpy('getServiceColorClass').and.returnValue('primary'),
  getServiceIcon: jasmine.createSpy('getServiceIcon').and.returnValue('scissors'),
  getServiceTranslation: jasmine.createSpy('getServiceTranslation').and.returnValue('Mocked Service')
};

// Mock AuthService
export const mockAuthService = {
  currentUser: jasmine.createSpy('currentUser').and.returnValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }),
  signIn: jasmine.createSpy('signIn'),
  signUp: jasmine.createSpy('signUp'),
  signOut: jasmine.createSpy('signOut'),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true)
};

// Mock ServicesService
export const mockServicesService = {
  getAllServices: jasmine.createSpy('getAllServices').and.returnValue(of([
    { id: '1', name: 'Haircut', duration: 60, price: 25 },
    { id: '2', name: 'Hair Coloring', duration: 120, price: 80 }
  ])),
  getServiceById: jasmine.createSpy('getServiceById').and.returnValue(of({
    id: '1', name: 'Haircut', duration: 60, price: 25
  })),
  addService: jasmine.createSpy('addService'),
  updateService: jasmine.createSpy('updateService'),
  deleteService: jasmine.createSpy('deleteService')
};

// Mock MessageService
export const mockMessageService = {
  add: jasmine.createSpy('add'),
  clear: jasmine.createSpy('clear'),
  addAll: jasmine.createSpy('addAll'),
  addOne: jasmine.createSpy('addOne'),
  remove: jasmine.createSpy('remove'),
  removeAll: jasmine.createSpy('removeAll')
};

// Mock Router
export const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  navigateByUrl: jasmine.createSpy('navigateByUrl'),
  url: '/test',
  events: of({}),
  routerState: { snapshot: { url: '/test' } }
};

// Mock ActivatedRoute
export const mockActivatedRoute = {
  params: of({}),
  queryParams: of({}),
  snapshot: { params: {}, queryParams: {} }
};

// Mock RoleService
export const mockRoleService = {
  currentRole: jasmine.createSpy('currentRole').and.returnValue('stylist'),
  setRole: jasmine.createSpy('setRole'),
  isStylist: jasmine.createSpy('isStylist').and.returnValue(true),
  isClient: jasmine.createSpy('isClient').and.returnValue(false),
  initializeRoleListener: jasmine.createSpy('initializeRoleListener')
};

// Mock CalendarPositionService
export const mockCalendarPositionService = {
  calculatePosition: jasmine.createSpy('calculatePosition').and.returnValue({ top: 0, left: 0 }),
  getTimeSlotPosition: jasmine.createSpy('getTimeSlotPosition').and.returnValue({ top: 0, left: 0 }),
  getDayPosition: jasmine.createSpy('getDayPosition').and.returnValue({ top: 0, left: 0 })
};

// Mock CalendarBusinessService
export const mockCalendarBusinessService = {
  getBusinessHours: jasmine.createSpy('getBusinessHours').and.returnValue({
    start: 8,
    end: 20,
    lunchStart: 13,
    lunchEnd: 14
  }),
  getBusinessDays: jasmine.createSpy('getBusinessDays').and.returnValue([1, 2, 3, 4, 5, 6]),
  isBusinessDay: jasmine.createSpy('isBusinessDay').and.returnValue(true),
  isBusinessHour: jasmine.createSpy('isBusinessHour').and.returnValue(true)
};

// Mock CalendarStateService
export const mockCalendarStateService = {
  selectedDate: jasmine.createSpy('selectedDate').and.returnValue(new Date()),
  setSelectedDate: jasmine.createSpy('setSelectedDate'),
  selectedTimeSlot: jasmine.createSpy('selectedTimeSlot').and.returnValue(null),
  setSelectedTimeSlot: jasmine.createSpy('setSelectedTimeSlot'),
  appointments: jasmine.createSpy('appointments').and.returnValue([]),
  setAppointments: jasmine.createSpy('setAppointments')
};

// Mock Firebase Auth
export const mockAuth = {
  currentUser: Promise.resolve({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }),
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => {}),
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  createUserWithEmailAndPassword: jasmine.createSpy('createUserWithEmailAndPassword'),
  signOut: jasmine.createSpy('signOut')
};

// Mock data for tests
export const mockData = {
  appointments: [
    {
      id: '1',
      nom: 'John Doe',
      data: '2024-01-15',
      hora: '10:00',
      servei: 'Corte de pelo',
      serviceName: 'Haircut',
      duration: 60,
      userId: 'user1'
    },
    {
      id: '2',
      nom: 'Jane Smith',
      data: '2024-01-15',
      hora: '14:00',
      servei: 'Coloración',
      serviceName: 'Hair Coloring',
      duration: 120,
      userId: 'user2'
    }
  ],
  services: [
    { id: '1', name: 'Haircut', duration: 60, price: 25 },
    { id: '2', name: 'Hair Coloring', duration: 120, price: 80 }
  ],
  stats: {
    total: 10,
    today: 3,
    pending: 2,
    completed: 5
  }
};
