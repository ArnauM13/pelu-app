// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { AppointmentsListComponent } from './appointments-list.component';
// import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../../testing/test-setup';
// import { Component, signal } from '@angular/core';
// import { Booking } from '../../../../core/interfaces/booking.interface';
// import { ServicesService } from '../../../../core/services/services.service';
// import { provideMockFirebase } from '../../../../../testing/firebase-mocks';

// // Test wrapper component to provide input signals
// @Component({
//   template: `
//     <pelu-appointments-list
//       [bookings]="bookings()"
//       [hasActiveFilters]="hasActiveFilters()"
//       [isSelectionMode]="isSelectionMode()"
//       [selectedIds]="selectedIds()"
//       [isAdmin]="isAdmin()"
//       (viewBooking)="onViewBooking($event)"
//       (deleteBooking)="onDeleteBooking($event)"
//       (clearFilters)="onClearFilters()"
//       (toggleSelection)="onToggleSelection($event)"
//       (bulkDelete)="onBulkDelete($event)"
//     >
//     </pelu-appointments-list>
//   `,
//   imports: [AppointmentsListComponent],
// })
// class TestWrapperComponent {
//   bookings = signal<Booking[]>([]);
//   hasActiveFilters = signal(false);
//   isSelectionMode = signal(false);
//   selectedIds = signal<Set<string>>(new Set());
//   isAdmin = signal(false);

//   onViewBooking(_booking: unknown) {}
//   onDeleteBooking(_booking: unknown) {}
//   onClearFilters() {}
//   onToggleSelection(_id: string) {}
//   onBulkDelete(_ids: string[]) {}
// }

// describe('AppointmentsListComponent', () => {
//   let component: AppointmentsListComponent;
//   let fixture: ComponentFixture<TestWrapperComponent>;
//   let servicesService: jasmine.SpyObj<ServicesService>;

//   beforeEach(async () => {
//     setupDefaultMocks();

//     const servicesServiceSpy = jasmine.createSpyObj('ServicesService', [
//       'getAllServices',
//       'getServiceName',
//     ]);

//     // Setup default return values
//     servicesServiceSpy.getAllServices.and.returnValue([
//       { id: '1', name: 'Haircut', duration: 30, price: 25 },
//       { id: '2', name: 'Hair Coloring', duration: 120, price: 80 },
//     ]);
//     servicesServiceSpy.getServiceName.and.returnValue('Haircut');

//     await configureTestBed([TestWrapperComponent], [
//       { provide: ServicesService, useValue: servicesServiceSpy },
//       provideMockFirebase(),
//     ]).compileComponents();

//     fixture = TestBed.createComponent(TestWrapperComponent);
//     component = fixture.debugElement.children[0].componentInstance;
//     servicesService = TestBed.inject(ServicesService) as jasmine.SpyObj<ServicesService>;

//     resetMocks();
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should have required input signals', () => {
//     expect(component.bookings).toBeDefined();
//     expect(component.hasActiveFilters).toBeDefined();
//     expect(component.isSelectionMode).toBeDefined();
//     expect(component.selectedIds).toBeDefined();
//     expect(component.isAdmin).toBeDefined();
//   });

//   it('should have output signals', () => {
//     expect(component.viewBooking).toBeDefined();
//     expect(component.deleteBooking).toBeDefined();
//     expect(component.clearFilters).toBeDefined();
//     expect(component.toggleSelection).toBeDefined();
//     expect(component.bulkDelete).toBeDefined();
//   });

//   it('should be defined', () => {
//     expect(component).toBeDefined();
//   });

//   it('should format time correctly', () => {
//     const result = component.formatTime('10:30');
//     expect(result).toBe('10:30');
//   });

//   it('should format date correctly', () => {
//     const result = component.formatDate('2024-01-15');
//     expect(result).toBeDefined();
//     expect(typeof result).toBe('string');
//   });

//   it('should identify today correctly', () => {
//     const today = new Date().toISOString().split('T')[0];
//     const result = component.isToday(today);
//     expect(result).toBe(true);
//   });

//   it('should identify non-today correctly', () => {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const yesterdayString = yesterday.toISOString().split('T')[0];
//     const result = component.isToday(yesterdayString);
//     expect(result).toBe(false);
//   });

//   it('should get client name from booking', () => {
//     const booking: Booking = {
//       clientName: 'John Doe',
//       id: '1',
//       email: '',
//       data: '',
//       hora: '',
//       serviceId: '',
//       status: 'confirmed',
//       createdAt: new Date()
//     };
//     const result = component.getClientName(booking);
//     expect(result).toBe('John Doe');
//   });

//   it('should get service name from booking with serviceId', () => {
//     const booking: Booking = {
//       clientName: 'John Doe',
//       id: '1',
//       email: '',
//       data: '',
//       hora: '',
//       serviceId: '1',
//       status: 'confirmed',
//       createdAt: new Date()
//     };
//     const result = component.getServiceName(booking);
//     expect(result).toBe('Haircut');
//     expect(servicesService.getAllServices).toHaveBeenCalled();
//     expect(servicesService.getServiceName).toHaveBeenCalled();
//   });

//   it('should return empty string for service name when no serviceId', () => {
//     const booking: Booking = {
//       clientName: 'John Doe',
//       id: '1',
//       email: '',
//       data: '',
//       hora: '',
//       serviceId: '',
//       status: 'confirmed',
//       createdAt: new Date()
//     };
//     const result = component.getServiceName(booking);
//     expect(result).toBe('');
//   });

//   it('should get service duration from booking with serviceId', () => {
//     const booking: Booking = {
//       clientName: 'John Doe',
//       id: '1',
//       email: '',
//       data: '',
//       hora: '',
//       serviceId: '1',
//       status: 'confirmed',
//       createdAt: new Date()
//     };
//     const result = component.getServiceDuration(booking);
//     expect(result).toBe(30);
//     expect(servicesService.getAllServices).toHaveBeenCalled();
//   });

//   it('should return default duration when no serviceId', () => {
//     const booking: Booking = {
//       clientName: 'John Doe',
//       id: '1',
//       email: '',
//       data: '',
//       hora: '',
//       serviceId: '',
//       status: 'confirmed',
//       createdAt: new Date()
//     };
//     const result = component.getServiceDuration(booking);
//     expect(result).toBe(60); // Default duration
//   });

//   it('should return default duration when service not found', () => {
//     const booking: Booking = {
//       clientName: 'John Doe',
//       id: '1',
//       email: '',
//       data: '',
//       hora: '',
//       serviceId: '999', // Non-existent service
//       status: 'confirmed',
//       createdAt: new Date()
//     };
//     const result = component.getServiceDuration(booking);
//     expect(result).toBe(60); // Default duration
//   });

//   it('should have notFoundConfig computed property', () => {
//     expect(component.notFoundConfig).toBeDefined();
//     expect(component.notFoundConfig.icon).toBe('📅');
//     expect(component.notFoundConfig.title).toBe('COMMON.NO_APPOINTMENTS');
//   });

//   it('should have isFutureAppointment function', () => {
//     expect(component.isFutureAppointment).toBeDefined();
//     expect(typeof component.isFutureAppointment).toBe('function');
//   });

//   describe('notFoundConfig behavior', () => {
//     it('should show clear filters button when hasActiveFilters is true', () => {
//       // Update the wrapper component's signal
//       const wrapperComponent = fixture.componentInstance;
//       wrapperComponent.hasActiveFilters.set(true);
//       fixture.detectChanges();

//       const config = component.notFoundConfig;
//       expect(config.showButton).toBe(true);
//       expect(config.buttonText).toBe('COMMON.CLEAR_FILTERS_BUTTON');
//       expect(config.message).toBe('COMMON.NO_APPOINTMENTS_FILTERED');
//     });

//     it('should not show clear filters button when hasActiveFilters is false', () => {
//       // Update the wrapper component's signal
//       const wrapperComponent = fixture.componentInstance;
//       wrapperComponent.hasActiveFilters.set(false);
//       fixture.detectChanges();

//       const config = component.notFoundConfig;
//       expect(config.showButton).toBe(false);
//       expect(config.buttonText).toBeUndefined();
//       expect(config.message).toBe('COMMON.NO_APPOINTMENTS_SCHEDULED');
//     });
//   });

//   describe('Service integration', () => {
//     it('should use ServicesService for service data', () => {
//       expect(servicesService).toBeDefined();
//       expect(servicesService.getAllServices).toBeDefined();
//       expect(servicesService.getServiceName).toBeDefined();
//     });

//     it('should call ServicesService methods when getting service data', () => {
//       const booking: Booking = {
//         clientName: 'John Doe',
//         id: '1',
//         email: '',
//         data: '',
//         hora: '',
//         serviceId: '1',
//         status: 'confirmed',
//         createdAt: new Date()
//       };

//       component.getServiceName(booking);
//       component.getServiceDuration(booking);

//       expect(servicesService.getAllServices).toHaveBeenCalledTimes(2);
//       expect(servicesService.getServiceName).toHaveBeenCalled();
//     });
//   });

//   describe('Component functionality', () => {
//     it('should handle empty bookings list', () => {
//       const wrapperComponent = fixture.componentInstance;
//       wrapperComponent.bookings.set([]);
//       fixture.detectChanges();

//       expect(component.bookings()).toEqual([]);
//     });

//     it('should handle bookings with data', () => {
//       const mockBookings: Booking[] = [
//         {
//           id: '1',
//           clientName: 'John Doe',
//           email: 'john@example.com',
//           data: '2024-01-15',
//           hora: '10:00',
//           serviceId: '1',
//           status: 'confirmed',
//           createdAt: new Date()
//         }
//       ];

//       const wrapperComponent = fixture.componentInstance;
//       wrapperComponent.bookings.set(mockBookings);
//       fixture.detectChanges();

//       expect(component.bookings()).toEqual(mockBookings);
//     });

//     it('should handle selection mode with bookings', () => {
//       const mockBookings: Booking[] = [
//         {
//           id: '1',
//           clientName: 'John Doe',
//           email: 'john@example.com',
//           data: '2024-01-15',
//           hora: '10:00',
//           serviceId: '1',
//           status: 'confirmed',
//           createdAt: new Date()
//         },
//         {
//           id: '2',
//           clientName: 'Jane Smith',
//           email: 'jane@example.com',
//           data: '2024-01-16',
//           hora: '14:00',
//           serviceId: '2',
//           status: 'confirmed',
//           createdAt: new Date()
//         }
//       ];

//       const wrapperComponent = fixture.componentInstance;
//       wrapperComponent.bookings.set(mockBookings);
//       wrapperComponent.isSelectionMode.set(true);
//       wrapperComponent.selectedIds.set(new Set(['1']));
//       fixture.detectChanges();

//       expect(component.bookings()).toEqual(mockBookings);
//       expect(component.isSelectionMode()).toBe(true);
//       expect(component.selectedIds().has('1')).toBe(true);
//       expect(component.selectedIds().has('2')).toBe(false);
//     });

//     it('should handle admin mode with selection', () => {
//       const wrapperComponent = fixture.componentInstance;

//       wrapperComponent.isAdmin.set(true);
//       wrapperComponent.isSelectionMode.set(true);
//       fixture.detectChanges();

//       expect(component.isAdmin()).toBe(true);
//       expect(component.isSelectionMode()).toBe(true);
//     });
//   });

//   describe('Selection functionality', () => {
//     it('should handle selection mode changes', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Test selection mode off
//       wrapperComponent.isSelectionMode.set(false);
//       fixture.detectChanges();
//       expect(component.isSelectionMode()).toBe(false);

//       // Test selection mode on
//       wrapperComponent.isSelectionMode.set(true);
//       fixture.detectChanges();
//       expect(component.isSelectionMode()).toBe(true);
//     });

//     it('should handle selected IDs changes', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Test empty selection
//       wrapperComponent.selectedIds.set(new Set());
//       fixture.detectChanges();
//       expect(component.selectedIds().size).toBe(0);

//       // Test with selected IDs
//       const selectedSet = new Set(['1', '2']);
//       wrapperComponent.selectedIds.set(selectedSet);
//       fixture.detectChanges();
//       expect(component.selectedIds().size).toBe(2);
//       expect(component.selectedIds().has('1')).toBe(true);
//       expect(component.selectedIds().has('2')).toBe(true);
//     });

//     it('should handle admin mode changes', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Test admin mode off
//       wrapperComponent.isAdmin.set(false);
//       fixture.detectChanges();
//       expect(component.isAdmin()).toBe(false);

//       // Test admin mode on
//       wrapperComponent.isAdmin.set(true);
//       fixture.detectChanges();
//       expect(component.isAdmin()).toBe(true);
//     });
//   });

//     describe('Filter integration', () => {
//     it('should properly handle active filters state', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Test with no active filters
//       wrapperComponent.hasActiveFilters.set(false);
//       fixture.detectChanges();
//       expect(component.hasActiveFilters()).toBe(false);

//       // Test with active filters
//       wrapperComponent.hasActiveFilters.set(true);
//       fixture.detectChanges();
//       expect(component.hasActiveFilters()).toBe(true);
//     });

//     it('should show appropriate message based on filter state', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Test no filters message
//       wrapperComponent.hasActiveFilters.set(false);
//       fixture.detectChanges();
//       let config = component.notFoundConfig;
//       expect(config.message).toBe('COMMON.NO_APPOINTMENTS_SCHEDULED');

//       // Test filtered message
//       wrapperComponent.hasActiveFilters.set(true);
//       fixture.detectChanges();
//       config = component.notFoundConfig;
//       expect(config.message).toBe('COMMON.NO_APPOINTMENTS_FILTERED');
//     });

//     it('should handle empty state with clear filters button when filters are active', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Set up empty bookings with active filters
//       wrapperComponent.bookings.set([]);
//       wrapperComponent.hasActiveFilters.set(true);
//       fixture.detectChanges();

//       const config = component.notFoundConfig;
//       expect(config.showButton).toBe(true);
//       expect(config.buttonText).toBe('COMMON.CLEAR_FILTERS_BUTTON');
//       expect(config.message).toBe('COMMON.NO_APPOINTMENTS_FILTERED');
//     });

//     it('should handle empty state without clear filters button when no filters are active', () => {
//       const wrapperComponent = fixture.componentInstance;

//       // Set up empty bookings with no active filters
//       wrapperComponent.bookings.set([]);
//       wrapperComponent.hasActiveFilters.set(false);
//       fixture.detectChanges();

//       const config = component.notFoundConfig;
//       expect(config.showButton).toBe(false);
//       expect(config.message).toBe('COMMON.NO_APPOINTMENTS_SCHEDULED');
//     });
//   });
// });
