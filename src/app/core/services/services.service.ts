import { Injectable, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirebaseServicesService, FirebaseService } from './firebase-services.service';

export interface ServiceColor {
  id: string;
  translationKey: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

// Re-export FirebaseService interface
export type Service = FirebaseService;
export type ServiceCategory = import('./firebase-services.service').ServiceCategory;

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  // Inject services
  #translationService = inject(TranslationService);
  #translateService = inject(TranslateService);
  #firebaseServicesService = inject(FirebaseServicesService);

  // Service colors configuration
  private readonly serviceColors: ServiceColor[] = [
    {
      id: 'haircut',
      translationKey: 'SERVICES.COLORS.HAIRCUT',
      color: 'var(--service-haircut-color)',
      backgroundColor: 'var(--service-haircut-bg)',
      borderColor: 'var(--service-haircut-color)',
      textColor: 'var(--service-haircut-text)',
    },
    {
      id: 'styling',
      translationKey: 'SERVICES.COLORS.STYLING',
      color: 'var(--service-styling-color)',
      backgroundColor: 'var(--service-styling-bg)',
      borderColor: 'var(--service-styling-color)',
      textColor: 'var(--service-styling-text)',
    },
    {
      id: 'treatment',
      translationKey: 'SERVICES.COLORS.TREATMENT',
      color: 'var(--service-treatment-color)',
      backgroundColor: 'var(--service-treatment-bg)',
      borderColor: 'var(--service-treatment-color)',
      textColor: 'var(--service-treatment-text)',
    },
    {
      id: 'coloring',
      translationKey: 'SERVICES.COLORS.COLORING',
      color: 'var(--service-coloring-color)',
      backgroundColor: 'var(--service-coloring-bg)',
      borderColor: 'var(--service-coloring-color)',
      textColor: 'var(--service-coloring-text)',
    },
    {
      id: 'special',
      translationKey: 'SERVICES.COLORS.SPECIAL',
      color: 'var(--service-special-color)',
      backgroundColor: 'var(--service-special-bg)',
      borderColor: 'var(--service-special-color)',
      textColor: 'var(--service-special-text)',
    },
    {
      id: 'kids',
      translationKey: 'SERVICES.COLORS.KIDS',
      color: 'var(--service-kids-color)',
      backgroundColor: 'var(--service-kids-bg)',
      borderColor: 'var(--service-kids-color)',
      textColor: 'var(--service-kids-text)',
    },
    {
      id: 'default',
      translationKey: 'SERVICES.COLORS.DEFAULT',
      color: 'var(--service-default-color)',
      backgroundColor: 'var(--service-default-bg)',
      borderColor: 'var(--service-default-color)',
      textColor: 'var(--service-default-text)',
    },
  ];

  private readonly serviceColorMap = new Map<string, ServiceColor>();

  constructor() {
    // Initialize service colors map
    this.serviceColors.forEach(color => {
      this.serviceColorMap.set(color.id, color);
    });
  }

  /**
   * Get all services from Firebase
   */
  getAllServices(): Service[] {
    return this.#firebaseServicesService.activeServices();
  }

  /**
   * Get services by category from Firebase
   */
  getServicesByCategory(category: Service['category']): Service[] {
    return this.#firebaseServicesService.getServicesByCategory(category);
  }

  /**
   * Get a specific service by ID from Firebase
   */
  async getServiceById(id: string): Promise<Service | null> {
    return await this.#firebaseServicesService.getServiceById(id);
  }

  /**
   * Get popular services from Firebase
   */
  getPopularServices(): Service[] {
    return this.#firebaseServicesService.popularServices();
  }

  /**
   * Get all service categories from Firebase
   */
  getServiceCategories(): ServiceCategory[] {
    return this.#firebaseServicesService.serviceCategories();
  }

  /**
   * Get category by ID from Firebase
   */
  getCategoryById(id: string): ServiceCategory | undefined {
    return this.#firebaseServicesService.serviceCategories().find(category => category.id === id);
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

        const translated = this.#translateService.instant(category.name);
        return translated;
      } catch {
        return category.name;
      }
    }

    // Otherwise, use the internal translation mapping for plain text names
    return this.translateServiceName(category.name);
  }

  /**
   * Get category icon from Firebase
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
      const testTranslation = this.#translateService.instant('SERVICES.NAMES.MALE_HAIRCUT');
      return testTranslation !== 'SERVICES.NAMES.MALE_HAIRCUT';
    } catch {
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
        const translated = this.#translateService.instant(service.name);

        // If the translation returns the same key, it means the translation failed
        if (translated === service.name) {
          return service.name;
        }

        return translated;
      } catch {
        return service.name;
      }
    }

    // Otherwise, use the internal translation mapping for plain text names
    return this.translateServiceName(service.name);
  }

  /**
   * Get services with translated names
   */
  getServicesWithTranslatedNames(): Service[] {
    return this.getAllServices().map(service => ({
      ...service,
      name: this.getServiceName(service),
    }));
  }

  /**
   * Get services with translated names using observable
   */
  getServicesWithTranslatedNamesAsync(): Observable<Service[]> {
    return this.#translateService.get('SERVICES.NAMES.MALE_HAIRCUT').pipe(
      map(() => {
        // If we can get a translation, the service is ready
        return this.getAllServices().map(service => ({
          ...service,
          name: this.getServiceName(service),
        }));
      }),
      catchError(() => {
        // If translation fails, return services with original names
        return of(this.getAllServices());
      })
    );
  }

  /**
   * Search services by name or description
   */
  searchServices(query: string): Service[] {
    const lowerQuery = query.toLowerCase();
    const translatedServices = this.getServicesWithTranslatedNames();

    return translatedServices.filter(
      service =>
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get services within a price range
   */
  getServicesByPriceRange(minPrice: number, maxPrice: number): Service[] {
    return this.getServicesWithTranslatedNames().filter(
      service => service.price >= minPrice && service.price <= maxPrice
    );
  }

  /**
   * Get services within a duration range
   */
  getServicesByDurationRange(minDuration: number, maxDuration: number): Service[] {
    return this.getServicesWithTranslatedNames().filter(
      service => service.duration >= minDuration && service.duration <= maxDuration
    );
  }

  // ===== SERVICE TRANSLATION METHODS =====

  /**
   * Translates a service name to the current language
   */
  translateServiceName(serviceName: string): string {
    if (!serviceName) {
      return this.#translationService.get('SERVICES.NAMES.GENERAL_SERVICE');
    }

    // If the service name is already a translation key, translate it directly
    if (serviceName.startsWith('SERVICES.NAMES.')) {
      try {
        // Check if translations are ready
        if (!this.isTranslationReady()) {
          return serviceName;
        }

        const translated = this.#translateService.instant(serviceName);
        return translated;
      } catch {
        return serviceName;
      }
    }

    // If no translation key found, return the original service name
    return serviceName;
  }

  // ===== SERVICE COLOR METHODS =====

  /**
   * Obté el color d'un servei basat en la categoria del servei
   */
  getServiceColor(service: Service): ServiceColor {
    if (!service || !service.category) {
      return this.getDefaultColor();
    }

    const category = service.category.toLowerCase();

    // Mapeig de categories a IDs de colors
    if (category === 'haircut') {
      return this.serviceColorMap.get('haircut') || this.getDefaultColor();
    }

    if (category === 'styling') {
      return this.serviceColorMap.get('styling') || this.getDefaultColor();
    }

    if (category === 'treatment') {
      return this.serviceColorMap.get('treatment') || this.getDefaultColor();
    }

    if (category === 'coloring') {
      return this.serviceColorMap.get('coloring') || this.getDefaultColor();
    }

    if (category === 'special') {
      return this.serviceColorMap.get('special') || this.getDefaultColor();
    }

    if (category === 'kids') {
      return this.serviceColorMap.get('kids') || this.getDefaultColor();
    }

    if (category === 'beard') {
      return this.serviceColorMap.get('haircut') || this.getDefaultColor(); // Beard uses haircut colors
    }

    return this.getDefaultColor();
  }

  /**
   * Obté el nom traduït d'un color de servei
   */
  getServiceColorName(serviceColor: ServiceColor): string {
    return this.#translationService.get(serviceColor.translationKey);
  }

  /**
   * Obté el color per defecte
   */
  getDefaultColor(): ServiceColor {
    return this.serviceColorMap.get('default')!;
  }

  /**
   * Obté tots els colors disponibles
   */
  getAllColors(): ServiceColor[] {
    return [...this.serviceColors];
  }

  /**
   * Obté els colors únics dels serveis disponibles
   */
  getUniqueServiceColors(): ServiceColor[] {
    const uniqueColors = new Map<string, ServiceColor>();

    // Afegir colors per defecte
    this.serviceColors.forEach(color => {
      uniqueColors.set(color.id, color);
    });

    return Array.from(uniqueColors.values());
  }

  /**
   * Obté el nom de la classe CSS per a un servei
   */
  getServiceCssClass(service: Service): string {
    const serviceColor = this.getServiceColor(service);
    return `service-color-${serviceColor.id}`;
  }

  /**
   * Obté el nom de la classe CSS per al text d'un servei
   */
  getServiceTextCssClass(service: Service): string {
    const serviceColor = this.getServiceColor(service);
    return `service-text-${serviceColor.id}`;
  }

  /**
   * Obté el nom de la classe CSS per al fons d'un servei
   */
  getServiceBgCssClass(service: Service): string {
    const serviceColor = this.getServiceColor(service);
    return `service-bg-${serviceColor.id}`;
  }
}
