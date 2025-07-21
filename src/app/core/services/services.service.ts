import { Injectable, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ServiceColor {
  id: string;
  translationKey: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'haircut' | 'beard' | 'treatment' | 'styling' | 'coloring' | 'special' | 'kids' | 'default';
  icon: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: 'haircut' | 'beard' | 'treatment' | 'styling' | 'coloring' | 'special' | 'kids' | 'default';
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  // Inject services
  #translationService = inject(TranslationService);
  #translateService = inject(TranslateService);

  // Service colors configuration
  private readonly serviceColors: ServiceColor[] = [
    {
      id: 'haircut',
      translationKey: 'SERVICES.COLORS.HAIRCUT',
      color: 'var(--service-haircut-color)',
      backgroundColor: 'var(--service-haircut-bg)',
      borderColor: 'var(--service-haircut-color)',
      textColor: 'var(--service-haircut-text)'
    },
    {
      id: 'styling',
      translationKey: 'SERVICES.COLORS.STYLING',
      color: 'var(--service-styling-color)',
      backgroundColor: 'var(--service-styling-bg)',
      borderColor: 'var(--service-styling-color)',
      textColor: 'var(--service-styling-text)'
    },
    {
      id: 'treatment',
      translationKey: 'SERVICES.COLORS.TREATMENT',
      color: 'var(--service-treatment-color)',
      backgroundColor: 'var(--service-treatment-bg)',
      borderColor: 'var(--service-treatment-color)',
      textColor: 'var(--service-treatment-text)'
    },
    {
      id: 'coloring',
      translationKey: 'SERVICES.COLORS.COLORING',
      color: 'var(--service-coloring-color)',
      backgroundColor: 'var(--service-coloring-bg)',
      borderColor: 'var(--service-coloring-color)',
      textColor: 'var(--service-coloring-text)'
    },
    {
      id: 'special',
      translationKey: 'SERVICES.COLORS.SPECIAL',
      color: 'var(--service-special-color)',
      backgroundColor: 'var(--service-special-bg)',
      borderColor: 'var(--service-special-color)',
      textColor: 'var(--service-special-text)'
    },
    {
      id: 'kids',
      translationKey: 'SERVICES.COLORS.KIDS',
      color: 'var(--service-kids-color)',
      backgroundColor: 'var(--service-kids-bg)',
      borderColor: 'var(--service-kids-color)',
      textColor: 'var(--service-kids-text)'
    },
    {
      id: 'default',
      translationKey: 'SERVICES.COLORS.DEFAULT',
      color: 'var(--service-default-color)',
      backgroundColor: 'var(--service-default-bg)',
      borderColor: 'var(--service-default-color)',
      textColor: 'var(--service-default-text)'
    }
  ];

  private readonly serviceColorMap = new Map<string, ServiceColor>();

  // Service name translation mapping
  private readonly serviceNameMap = new Map<string, string>([
    // Catalan service names
    ['corte de cabell masculí', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['corte + afaitat', 'SERVICES.NAMES.HAIRCUT_BEARD'],
    ['afaitat de barba', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['arreglada de barba', 'SERVICES.NAMES.BEARD_TRIM'],
    ['lavada i tractament', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['coloració', 'SERVICES.NAMES.COLORING'],
    ['pentinat especial', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['tall infantil', 'SERVICES.NAMES.KIDS_HAIRCUT'],
    ['servei general', 'SERVICES.NAMES.GENERAL_SERVICE'],
    ['perruqueria completa', 'SERVICES.NAMES.COMPLETE_HAIRDRESSING'],
    ['servei de prova', 'SERVICES.NAMES.TEST_SERVICE'],

    // Spanish service names
    ['corte de cabello masculino', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['corte + afeitado', 'SERVICES.NAMES.HAIRCUT_BEARD'],
    ['afeitado de barba', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['arreglada de barba', 'SERVICES.NAMES.BEARD_TRIM'],
    ['lavada y tratamiento', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['coloración', 'SERVICES.NAMES.COLORING'],
    ['peinado especial', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['corte infantil', 'SERVICES.NAMES.KIDS_HAIRCUT'],
    ['servicio general', 'SERVICES.NAMES.GENERAL_SERVICE'],
    ['peluquería completa', 'SERVICES.NAMES.COMPLETE_HAIRDRESSING'],
    ['servicio de prueba', 'SERVICES.NAMES.TEST_SERVICE'],

    // English service names
    ['male haircut', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['haircut + shave', 'SERVICES.NAMES.HAIRCUT_BEARD'],
    ['beard shave', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['beard trim', 'SERVICES.NAMES.BEARD_TRIM'],
    ['wash and treatment', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['coloring', 'SERVICES.NAMES.COLORING'],
    ['special styling', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['kids haircut', 'SERVICES.NAMES.KIDS_HAIRCUT'],
    ['general service', 'SERVICES.NAMES.GENERAL_SERVICE'],
    ['complete hairdressing', 'SERVICES.NAMES.COMPLETE_HAIRDRESSING'],
    ['test service', 'SERVICES.NAMES.TEST_SERVICE'],

    // Arabic service names
    ['قص شعر رجالي', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['قص شعر + حلاقة', 'SERVICES.NAMES.HAIRCUT_BEARD'],
    ['حلاقة اللحية', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['تشذيب اللحية', 'SERVICES.NAMES.BEARD_TRIM'],
    ['غسيل وعلاج', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['تلوين', 'SERVICES.NAMES.COLORING'],
    ['تصفيف خاص', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['قص شعر للأطفال', 'SERVICES.NAMES.KIDS_HAIRCUT'],
    ['خدمة عامة', 'SERVICES.NAMES.GENERAL_SERVICE'],
    ['تجميل شعر كامل', 'SERVICES.NAMES.COMPLETE_HAIRDRESSING'],
    ['خدمة تجريبية', 'SERVICES.NAMES.TEST_SERVICE'],

    // Common variations
    ['tall de cabell', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['corte', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['haircut', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['afaitat', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['shave', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['barba', 'SERVICES.NAMES.BEARD_TRIM'],
    ['beard', 'SERVICES.NAMES.BEARD_TRIM'],
    ['tractament', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['treatment', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['color', 'SERVICES.NAMES.COLORING'],
    ['pentinat', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['styling', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['infantil', 'SERVICES.NAMES.KIDS_HAIRCUT'],
    ['kids', 'SERVICES.NAMES.KIDS_HAIRCUT'],
    ['completa', 'SERVICES.NAMES.COMPLETE_HAIRDRESSING'],
    ['complete', 'SERVICES.NAMES.COMPLETE_HAIRDRESSING'],
    ['prova', 'SERVICES.NAMES.TEST_SERVICE'],
    ['test', 'SERVICES.NAMES.TEST_SERVICE']
  ]);

  // Service categories configuration - single source of truth
  private readonly serviceCategories: ServiceCategory[] = [
    { id: 'haircut', name: 'SERVICES.CATEGORIES.HAIRCUT', icon: '✂️' },
    { id: 'beard', name: 'SERVICES.CATEGORIES.BEARD', icon: '🧔' },
    { id: 'treatment', name: 'SERVICES.CATEGORIES.TREATMENT', icon: '💆' },
    { id: 'styling', name: 'SERVICES.CATEGORIES.STYLING', icon: '💇' },
    { id: 'coloring', name: 'SERVICES.CATEGORIES.COLORING', icon: '🎨' },
    { id: 'special', name: 'SERVICES.CATEGORIES.SPECIAL', icon: '⭐' },
    { id: 'kids', name: 'SERVICES.CATEGORIES.KIDS', icon: '👶' },
    { id: 'default', name: 'SERVICES.CATEGORIES.DEFAULT', icon: '🔧' }
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

  constructor() {
    // Initialize service colors map
    this.serviceColors.forEach(color => {
      this.serviceColorMap.set(color.id, color);
    });
  }

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

        const translated = this.#translateService.instant(category.name);
        return translated;
      } catch (error) {
        return category.name;
      }
    }

    // Otherwise, use the internal translation mapping for plain text names
    return this.translateServiceName(category.name);
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
      const testTranslation = this.#translateService.instant('SERVICES.NAMES.MALE_HAIRCUT');
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
        const translated = this.#translateService.instant(service.name);

        // If the translation returns the same key, it means the translation failed
        if (translated === service.name) {
          return service.name;
        }

        return translated;
      } catch (error) {
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
    return this.allServices.map(service => ({
      ...service,
      name: this.getServiceName(service)
    }));
  }

  /**
   * Get services with translated names using observable
   */
  getServicesWithTranslatedNamesAsync(): Observable<Service[]> {
    return this.#translateService.get('SERVICES.NAMES.MALE_HAIRCUT').pipe(
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

  // ===== SERVICE TRANSLATION METHODS =====

  /**
   * Translates a service name to the current language
   */
  translateServiceName(serviceName: string): string {
    if (!serviceName) {
      return this.#translationService.get('SERVICES.NAMES.GENERAL_SERVICE');
    }

    const serviceNameLower = serviceName.toLowerCase().trim();

    // Try to find an exact match first
    const translationKey = this.serviceNameMap.get(serviceNameLower);
    if (translationKey) {
      return this.#translationService.get(translationKey);
    }

    // Try to find a partial match
    for (const [key, value] of this.serviceNameMap.entries()) {
      if (serviceNameLower.includes(key) || key.includes(serviceNameLower)) {
        return this.#translationService.get(value);
      }
    }

    // If no match found, return the original service name
    return serviceName;
  }

  /**
   * Gets the translation key for a service name
   */
  getServiceTranslationKey(serviceName: string): string {
    if (!serviceName) {
      return 'SERVICES.NAMES.GENERAL_SERVICE';
    }

    const serviceNameLower = serviceName.toLowerCase().trim();

    // Try to find an exact match first
    const translationKey = this.serviceNameMap.get(serviceNameLower);
    if (translationKey) {
      return translationKey;
    }

    // Try to find a partial match
    for (const [key, value] of this.serviceNameMap.entries()) {
      if (serviceNameLower.includes(key) || key.includes(serviceNameLower)) {
        return value;
      }
    }

    // If no match found, return the general service key
    return 'SERVICES.NAMES.GENERAL_SERVICE';
  }

  // ===== SERVICE COLOR METHODS =====

  /**
   * Obté el color d'un servei basat en el nom del servei
   */
  getServiceColor(serviceName: string): ServiceColor {
    if (!serviceName) {
      return this.getDefaultColor();
    }

    const serviceNameLower = serviceName.toLowerCase();

    // Mapeig de noms de serveis a IDs de colors
    if (serviceNameLower.includes('corte') || serviceNameLower.includes('tall') || serviceNameLower.includes('cabell')) {
      return this.serviceColorMap.get('haircut') || this.getDefaultColor();
    }

    if (serviceNameLower.includes('peinat') || serviceNameLower.includes('pentinat') || serviceNameLower.includes('estil') || serviceNameLower.includes('estilitzat')) {
      return this.serviceColorMap.get('styling') || this.getDefaultColor();
    }

    if (serviceNameLower.includes('tractament') || serviceNameLower.includes('màscara') || serviceNameLower.includes('hidratació') || serviceNameLower.includes('rentat')) {
      return this.serviceColorMap.get('treatment') || this.getDefaultColor();
    }

    if (serviceNameLower.includes('color') || serviceNameLower.includes('tint') || serviceNameLower.includes('coloració')) {
      return this.serviceColorMap.get('coloring') || this.getDefaultColor();
    }

    if (serviceNameLower.includes('especial') || serviceNameLower.includes('event') || serviceNameLower.includes('completa')) {
      return this.serviceColorMap.get('special') || this.getDefaultColor();
    }

    if (serviceNameLower.includes('infantil') || serviceNameLower.includes('nen') || serviceNameLower.includes('nena') || serviceNameLower.includes('infant')) {
      return this.serviceColorMap.get('kids') || this.getDefaultColor();
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
  getServiceCssClass(serviceName: string): string {
    const serviceColor = this.getServiceColor(serviceName);
    return `service-color-${serviceColor.id}`;
  }

  /**
   * Obté el nom de la classe CSS per al text d'un servei
   */
  getServiceTextCssClass(serviceName: string): string {
    const serviceColor = this.getServiceColor(serviceName);
    return `service-text-${serviceColor.id}`;
  }

  /**
   * Obté el nom de la classe CSS per al fons d'un servei
   */
  getServiceBgCssClass(serviceName: string): string {
    const serviceColor = this.getServiceColor(serviceName);
    return `service-bg-${serviceColor.id}`;
  }
}
