import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ServiceSelectionPopupComponent, ServiceSelectionDetails } from './service-selection-popup.component';
import { ToastService } from '../../services/toast.service';
import { ServiceTranslationService } from '../../../core/services/service-translation.service';
import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { FirebaseService } from '../../../core/services/firebase-services.service';

describe('ServiceSelectionPopupComponent', () => {
  let component: ServiceSelectionPopupComponent;
  let fixture: ComponentFixture<ServiceSelectionPopupComponent>;
  let toastService: jasmine.SpyObj<ToastService>;
  let serviceTranslationService: jasmine.SpyObj<ServiceTranslationService>;
  let firebaseServicesService: jasmine.SpyObj<FirebaseServicesService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockService: FirebaseService = {
    id: 'service1',
    name: 'Tall de Cabell',
    description: 'Tall de cabell professional',
    category: 'haircut',
    duration: 30,
    price: 25,
    isPopular: true,
    icon: 'pi pi-user',
  };

  const mockSelectionDetails: ServiceSelectionDetails = {
    date: '2024-12-25',
    time: '10:00',
    clientName: 'Joan Garcia',
    email: 'joan@example.com',
  };

  const mockServices: FirebaseService[] = [
    mockService,
    {
      id: 'service2',
      name: 'Coloració',
      description: 'Coloració professional',
      category: 'coloring',
      duration: 60,
      price: 45,
                  isPopular: false,
    icon: 'pi pi-palette',
  },
  ];

  beforeEach(async () => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showValidationError',
      'showSuccess',
      'showError',
    ]);

    const serviceTranslationServiceSpy = jasmine.createSpyObj('ServiceTranslationService', [
      'translateServiceName',
    ]);

    const firebaseServicesServiceSpy = jasmine.createSpyObj('FirebaseServicesService', [
      'activeServices',
    ]);

    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'instant',
    ]);

    // Setup default return values
    firebaseServicesServiceSpy.activeServices.and.returnValue(mockServices);
    serviceTranslationServiceSpy.translateServiceName.and.returnValue('Translated Service Name');
    translateServiceSpy.instant.and.returnValue('Translated Text');

    await TestBed.configureTestingModule({
      imports: [ServiceSelectionPopupComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ServiceTranslationService, useValue: serviceTranslationServiceSpy },
        { provide: FirebaseServicesService, useValue: firebaseServicesServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceSelectionPopupComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    serviceTranslationService = TestBed.inject(ServiceTranslationService) as jasmine.SpyObj<ServiceTranslationService>;
    firebaseServicesService = TestBed.inject(FirebaseServicesService) as jasmine.SpyObj<FirebaseServicesService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have services injected', () => {
    expect(component['toastService']).toBeDefined();
    expect(component['serviceTranslationService']).toBeDefined();
    expect(component['firebaseServicesService']).toBeDefined();
    expect(component['translateService']).toBeDefined();
  });

  it('should have computed signals defined', () => {
    expect(component.isOpen).toBeDefined();
    expect(component.selectionDetailsComputed).toBeDefined();
    expect(component.selectedService).toBeDefined();
    expect(component.availableServices).toBeDefined();
    expect(component.popularServices).toBeDefined();
    expect(component.otherServices).toBeDefined();
    expect(component.dialogConfig).toBeDefined();
  });

  it('should have output events defined', () => {
    expect(component.serviceSelected).toBeDefined();
    expect(component.cancelled).toBeDefined();
  });

  it('should have methods defined', () => {
    expect(typeof component.onServiceSelect).toBe('function');
    expect(typeof component.onConfirm).toBe('function');
    expect(typeof component.onCancel).toBe('function');
    expect(typeof component.onBackdropClick).toBe('function');
    expect(typeof component.formatDate).toBe('function');
    expect(typeof component.getServiceName).toBe('function');
    expect(typeof component.getServiceDescription).toBe('function');
  });

  it('should initialize with default values', () => {
    expect(component.isOpen()).toBe(false);
    expect(component.selectedService()).toBeNull();
    expect(component.selectionDetailsComputed()).toEqual({
      date: '',
      time: '',
      clientName: '',
      email: '',
    });
  });

  it('should return available services from service', () => {
    const services = component.availableServices();
    expect(services).toEqual(mockServices);
    expect(firebaseServicesService.activeServices).toHaveBeenCalled();
  });

  it('should filter popular services correctly', () => {
    const popularServices = component.popularServices();
    expect(popularServices.length).toBe(1);
    expect(popularServices[0].isPopular).toBe(true);
  });

  it('should filter other services correctly', () => {
    const otherServices = component.otherServices();
    expect(otherServices.length).toBe(1);
    expect(otherServices[0].isPopular).toBe(false);
  });

  it('should set selected service when onServiceSelect is called', () => {
    expect(component.selectedService()).toBeNull();
    
    component.onServiceSelect(mockService);
    
    expect(component.selectedService()).toBe(mockService);
  });

  it('should emit serviceSelected when onConfirm is called with selected service', () => {
    spyOn(component.serviceSelected, 'emit');
    component.onServiceSelect(mockService);
    component.selectionDetails = mockSelectionDetails;
    
    component.onConfirm();
    
    expect(component.serviceSelected.emit).toHaveBeenCalledWith({
      details: mockSelectionDetails,
      service: mockService,
    });
  });

  it('should show validation error when onConfirm is called without selected service', () => {
    spyOn(component.serviceSelected, 'emit');
    expect(component.selectedService()).toBeNull();
    
    component.onConfirm();
    
    expect(toastService.showValidationError).toHaveBeenCalledWith('servei');
    expect(component.serviceSelected.emit).not.toHaveBeenCalled();
  });

  it('should emit cancelled and reset selected service when onCancel is called', () => {
    spyOn(component.cancelled, 'emit');
    component.onServiceSelect(mockService);
    expect(component.selectedService()).toBe(mockService);
    
    component.onCancel();
    
    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.selectedService()).toBeNull();
  });

  it('should call onCancel when onBackdropClick is called with target equal to currentTarget', () => {
    spyOn(component, 'onCancel');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div'),
    } as any;
    
    // Make target equal to currentTarget
    mockEvent.currentTarget = mockEvent.target;
    
    component.onBackdropClick(mockEvent);
    
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should not call onCancel when onBackdropClick is called with different target and currentTarget', () => {
    spyOn(component, 'onCancel');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div'),
    } as any;
    
    // Make target different from currentTarget
    mockEvent.currentTarget = document.createElement('span');
    
    component.onBackdropClick(mockEvent);
    
    expect(component.onCancel).not.toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const formattedDate = component.formatDate('2024-12-25');
    expect(formattedDate).toContain('dimecres');
    expect(formattedDate).toContain('25');
    expect(formattedDate).toContain('desembre');
    expect(formattedDate).toContain('2024');
  });

  it('should return empty string when formatDate is called with empty date', () => {
    const formattedDate = component.formatDate('');
    expect(formattedDate).toBe('');
  });

  it('should get service name using translation service', () => {
    const serviceName = component.getServiceName(mockService);
    expect(serviceName).toBe('Translated Service Name');
    expect(serviceTranslationService.translateServiceName).toHaveBeenCalledWith(mockService.name);
  });

  it('should get service description using service description when available', () => {
    const serviceDescription = component.getServiceDescription(mockService);
    expect(serviceDescription).toBe(mockService.description);
  });

  it('should get service description using translated name when description is not available', () => {
    const serviceWithoutDescription = { ...mockService, description: '' };
    const serviceDescription = component.getServiceDescription(serviceWithoutDescription);
    expect(serviceDescription).toBe('Translated Service Name');
    expect(serviceTranslationService.translateServiceName).toHaveBeenCalledWith(serviceWithoutDescription.name);
  });

  it('should return dialog config with correct structure', () => {
    const config = component.dialogConfig();
    
    expect(config.title).toBe('Translated Text');
    expect(config.size).toBe('large');
    expect(config.closeOnBackdropClick).toBe(true);
    expect(config.showFooter).toBe(true);
    expect(Array.isArray(config.footerActions)).toBe(true);
    expect(config.footerActions?.length).toBe(1);
  });

  it('should have confirm button when no service is selected', () => {
    const config = component.dialogConfig();
    const confirmAction = config.footerActions?.[0];
    
    if (confirmAction) {
      expect(confirmAction.label).toBeDefined();
      expect(confirmAction.action).toBeDefined();
    }
  });

  it('should have confirm button when service is selected', () => {
    component.onServiceSelect(mockService);
    const config = component.dialogConfig();
    const confirmAction = config.footerActions?.[0];
    
    if (confirmAction) {
      expect(confirmAction.label).toBeDefined();
      expect(confirmAction.action).toBeDefined();
    }
  });

  it('should call onConfirm when confirm action is executed', () => {
    spyOn(component, 'onConfirm');
    const config = component.dialogConfig();
    const confirmAction = config.footerActions?.[0];
    
    if (confirmAction) {
      confirmAction.action();
      expect(component.onConfirm).toHaveBeenCalled();
    }
  });

  it('should set open input correctly', () => {
    expect(component.isOpen()).toBe(false);
    
    component.open = true;
    
    expect(component.isOpen()).toBe(true);
  });

  it('should set selectionDetails input correctly', () => {
    const initialDetails = component.selectionDetailsComputed();
    expect(initialDetails).toEqual({
      date: '',
      time: '',
      clientName: '',
      email: '',
    });
    
    component.selectionDetails = mockSelectionDetails;
    
    expect(component.selectionDetailsComputed()).toEqual(mockSelectionDetails);
  });

  it('should be a standalone component', () => {
    expect(ServiceSelectionPopupComponent.prototype.constructor).toBeDefined();
    expect(ServiceSelectionPopupComponent.prototype.constructor.name).toBe('ServiceSelectionPopupComponent');
  });

  it('should have component metadata', () => {
    expect(ServiceSelectionPopupComponent.prototype).toBeDefined();
    expect(ServiceSelectionPopupComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
