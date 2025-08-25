import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AboutPageComponent } from './about-page.component';
import { FirebaseServicesService, type FirebaseService, type ServiceCategory } from '../../../core/services/firebase-services.service';

class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('AboutPageComponent', () => {
  let component: AboutPageComponent;
  let fixture: ComponentFixture<AboutPageComponent>;

  const categories: ServiceCategory[] = [
    { id: 'haircut', name: 'SERVICES.CATEGORIES.HAIRCUT', icon: '✂️' },
    { id: 'beard', name: 'SERVICES.CATEGORIES.BEARD', icon: '🧔' },
  ];

  const services: FirebaseService[] = [
    {
      id: '1',
      name: 'Basic Haircut',
      description: 'A simple haircut',
      price: 20,
      duration: 30,
      category: 'haircut',
      icon: '✂️',
      isPopular: true,
      isActive: true,
    },
    {
      id: '2',
      name: 'Beard Trim',
      description: 'Trim and shape the beard',
      price: 12,
      duration: 15,
      category: 'beard',
      icon: '🧔',
      isActive: true,
    },
  ];

  const createMockService = (loading: boolean) => {
    const mock = jasmine.createSpyObj<FirebaseServicesService>('FirebaseServicesService', [
      'loadServices',
      'isLoading',
      'services',
      'serviceCategories',
      'getServicesByCategory',
      'getCategoryName',
      'getCategoryIcon',
    ]);

    mock.loadServices.and.returnValue(Promise.resolve());
    mock.isLoading.and.returnValue(loading);
    mock.services.and.returnValue(services);
    mock.serviceCategories.and.returnValue(categories);
    mock.getServicesByCategory.and.callFake((categoryId: string) =>
      services.filter(s => s.category === categoryId)
    );
    mock.getCategoryName.and.callFake((categoryId: string) =>
      categories.find(c => c.id === categoryId)?.name || 'SERVICES.CATEGORIES.DEFAULT'
    );
    mock.getCategoryIcon.and.callFake((categoryId: string) =>
      categories.find(c => c.id === categoryId)?.icon || '✂️'
    );

    return mock;
  };

  const configure = async (loading: boolean) => {
    await TestBed.configureTestingModule({
      imports: [
        AboutPageComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: MockTranslateLoader } }),
      ],
      providers: [
        { provide: FirebaseServicesService, useValue: createMockService(loading) },
      ],
      // Shallow render: ignore unknown elements/attributes like child components and pAnimateOnScroll
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPageComponent);
    component = fixture.componentInstance;
  };

  it('should create', async () => {
    await configure(false);
    expect(component).toBeTruthy();
  });

  it('should call loadServices on init', async () => {
    await configure(false);
    const service = TestBed.inject(FirebaseServicesService) as jasmine.SpyObj<FirebaseServicesService>;
    spyOn(component, 'loadServices').and.callThrough();
    fixture.detectChanges();
    expect(component.loadServices).toHaveBeenCalled();
    expect(service.loadServices).toHaveBeenCalled();
  });

  it('should show loading state when isLoading is true', async () => {
    await configure(true);
    fixture.detectChanges();
    const loadingEl = fixture.nativeElement.querySelector('pelu-loading-state');
    expect(loadingEl).not.toBeNull();
  });

  it('should render services showcase when not loading', async () => {
    await configure(false);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.services-showcase');
    expect(section).not.toBeNull();
  });

  it('should compute services grouped by category (only non-empty)', async () => {
    await configure(false);
    // One service per category in mock, so both categories should appear
    const grouped = component.servicesByCategory();
    expect(Array.isArray(grouped)).toBeTrue();
    expect(grouped.length).toBe(2);
    expect(grouped.every(g => g.services && g.services.length > 0)).toBeTrue();
  });

  it('should delegate category helpers to the service', async () => {
    await configure(false);
    const service = TestBed.inject(FirebaseServicesService) as jasmine.SpyObj<FirebaseServicesService>;

    const name = component.getCategoryName('haircut');
    const icon = component.getCategoryIcon('haircut');

    expect(service.getCategoryName).toHaveBeenCalledWith('haircut');
    expect(service.getCategoryIcon).toHaveBeenCalledWith('haircut');
    expect(typeof name).toBe('string');
    expect(typeof icon).toBe('string');
  });
});



