import { Injectable } from '@angular/core';
import { ServiceTranslationService } from './service-translation.service';
import { TranslationService } from './translation.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'haircut' | 'beard' | 'treatment' | 'styling';
  icon: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: 'haircut' | 'beard' | 'treatment' | 'styling';
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  // Service categories configuration - single source of truth
  private readonly serviceCategories: ServiceCategory[] = [
    { id: 'haircut', name: 'SERVICES.CATEGORIES.HAIRCUT', icon: '✂️' },
    { id: 'beard', name: 'SERVICES.CATEGORIES.BEARD', icon: '🧔' },
    { id: 'treatment', name: 'SERVICES.CATEGORIES.TREATMENT', icon: '💆' },
    { id: 'styling', name: 'SERVICES.CATEGORIES.STYLING', icon: '💇' }
  ];

  // All services - single source of truth
  private readonly allServices: Service[] = [
    {
      id: '1',
      name: 'SERVICES.NAMES.MALE_HAIRCUT',
      description: 'Corte clàssic o modern segons les teves preferències',
      price: 25,
      duration: 30,
      category: 'haircut',
      icon: '✂️',
      popular: true
    },
    {
      id: '2',
      name: 'SERVICES.NAMES.HAIRCUT_BEARD',
      description: 'Corte complet amb afaitat de barba inclòs',
      price: 35,
      duration: 45,
      category: 'haircut',
      icon: '✂️',
      popular: true
    },
    {
      id: '3',
      name: 'SERVICES.NAMES.BEARD_SHAVE',
      description: 'Afaitat tradicional amb navalla o màquina',
      price: 15,
      duration: 20,
      category: 'beard',
      icon: '🧔'
    },
    {
      id: '4',
      name: 'SERVICES.NAMES.BEARD_TRIM',
      description: 'Perfilat i arreglada de barba',
      price: 12,
      duration: 15,
      category: 'beard',
      icon: '🧔'
    },
    {
      id: '5',
      name: 'SERVICES.NAMES.WASH_TREATMENT',
      description: 'Lavada professional amb productes de qualitat',
      price: 18,
      duration: 25,
      category: 'treatment',
      icon: '💆'
    },
    {
      id: '6',
      name: 'SERVICES.NAMES.COLORING',
      description: 'Coloració completa o retocs',
      price: 45,
      duration: 60,
      category: 'treatment',
      icon: '💆',
      popular: true
    },
    {
      id: '7',
      name: 'SERVICES.NAMES.SPECIAL_STYLING',
      description: 'Peinat per a esdeveniments especials',
      price: 30,
      duration: 40,
      category: 'styling',
      icon: '💇',
      popular: true
    },
    {
      id: '8',
      name: 'SERVICES.NAMES.KIDS_HAIRCUT',
      description: 'Corte especialitzat per a nens',
      price: 18,
      duration: 25,
      category: 'haircut',
      icon: '✂️'
    }
  ];

  constructor(
    private serviceTranslationService: ServiceTranslationService,
    private translationService: TranslationService,
    private translateService: TranslateService
  ) {}

  /**
   * Get all services
   */
  getAllServices(): Service[] {
    return this.getServicesWithTranslatedNames();
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: Service['category']): Service[] {
    return this.getServicesWithTranslatedNames().filter(service => service.category === category);
  }

  /**
   * Get a specific service by ID
   */
  getServiceById(id: string): Service | undefined {
    const service = this.allServices.find(service => service.id === id);
    if (!service) return undefined;

    return {
      ...service,
      name: this.getServiceName(service)
    };
  }

  /**
   * Get popular services
   */
  getPopularServices(): Service[] {
    return this.getServicesWithTranslatedNames().filter(service => service.popular);
  }

  /**
   * Get all service categories
   */
  getServiceCategories(): ServiceCategory[] {
    return [...this.serviceCategories];
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): ServiceCategory | undefined {
    return this.serviceCategories.find(category => category.id === id);
  }

  /**
   * Get category name (translated)
   */
  getCategoryName(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    if (!category) return 'Altres';

    // If the category name is already a translation key, translate it directly
    if (category.name.startsWith('SERVICES.CATEGORIES.')) {
      try {
        // Check if translations are ready
        if (!this.isTranslationReady()) {
          return category.name;
        }

        const translated = this.translateService.instant(category.name);
        return translated;
      } catch (error) {
        return category.name;
      }
    }

    // Otherwise, use the service translation service for plain text names
    return this.serviceTranslationService.translateServiceName(category.name);
  }

  /**
   * Get category icon
   */
  getCategoryIcon(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.icon || '✂️';
  }

  /**
   * Check if translations are loaded
   */
  private isTranslationReady(): boolean {
    try {
      // Try to get a known translation key
      const testTranslation = this.translateService.instant('SERVICES.NAMES.MALE_HAIRCUT');
      return testTranslation !== 'SERVICES.NAMES.MALE_HAIRCUT';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service name (translated)
   */
  getServiceName(service: Service): string {
    // If the service name is already a translation key, translate it directly
    if (service.name.startsWith('SERVICES.NAMES.')) {
      try {
        // Check if translations are ready
        if (!this.isTranslationReady()) {
          return service.name;
        }

        // Try using TranslateService directly
        const translated = this.translateService.instant(service.name);

        // If the translation returns the same key, it means the translation failed
        if (translated === service.name) {
          return service.name;
        }

        return translated;
      } catch (error) {
        return service.name;
      }
    }

    // Otherwise, use the service translation service for plain text names
    return this.serviceTranslationService.translateServiceName(service.name);
  }

  /**
   * Get services with translated names
   */
  getServicesWithTranslatedNames(): Service[] {
    return this.allServices.map(service => ({
      ...service,
      name: this.getServiceName(service)
    }));
  }

  /**
   * Get services with translated names using observable
   */
  getServicesWithTranslatedNamesAsync(): Observable<Service[]> {
    return this.translateService.get('SERVICES.NAMES.MALE_HAIRCUT').pipe(
      map(() => {
        // If we can get a translation, the service is ready
        return this.allServices.map(service => ({
          ...service,
          name: this.getServiceName(service)
        }));
      }),
      catchError(() => {
        // If translation fails, return services with original names
        return of(this.allServices);
      })
    );
  }

  /**
   * Search services by name or description
   */
  searchServices(query: string): Service[] {
    const lowerQuery = query.toLowerCase();
    const translatedServices = this.getServicesWithTranslatedNames();

    return translatedServices.filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get services within a price range
   */
  getServicesByPriceRange(minPrice: number, maxPrice: number): Service[] {
    return this.getServicesWithTranslatedNames().filter(service =>
      service.price >= minPrice && service.price <= maxPrice
    );
  }

  /**
   * Get services within a duration range
   */
  getServicesByDurationRange(minDuration: number, maxDuration: number): Service[] {
    return this.getServicesWithTranslatedNames().filter(service =>
      service.duration >= minDuration && service.duration <= maxDuration
    );
  }
}
