import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceTranslationService {
  private readonly serviceNameMap = new Map<string, string>([
    // Spanish service names
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

    // Firebase sample service names (Catalan) - Exact matches
    ['tall masculí', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['tall + afaitat', 'SERVICES.NAMES.HAIRCUT_BEARD'],
    ['afaitat de barba', 'SERVICES.NAMES.BEARD_SHAVE'],
    ['arreglada de barba', 'SERVICES.NAMES.BEARD_TRIM'],
    ['lavada i tractament', 'SERVICES.NAMES.WASH_TREATMENT'],
    ['coloració', 'SERVICES.NAMES.COLORING'],
    ['pentinat especial', 'SERVICES.NAMES.SPECIAL_STYLING'],
    ['tall infantil', 'SERVICES.NAMES.KIDS_HAIRCUT'],

    // Common variations and partial matches
    ['tall de cabell', 'SERVICES.NAMES.MALE_HAIRCUT'],
    ['tall', 'SERVICES.NAMES.MALE_HAIRCUT'],
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
    ['test', 'SERVICES.NAMES.TEST_SERVICE'],
  ]);

  constructor(private translationService: TranslationService) {}

  /**
   * Translates a service name to the current language
   */
  translateServiceName(serviceName: string): string {
    if (!serviceName) {
      return this.translationService.get('SERVICES.NAMES.GENERAL_SERVICE');
    }

    // If the service name is already a translation key, translate it directly
    if (serviceName.startsWith('SERVICES.NAMES.')) {
      try {
        const translated = this.translationService.get(serviceName);
        // If the translation returns the same key, it means the translation failed
        if (translated === serviceName) {
          return serviceName;
        }
        return translated;
      } catch (error) {
        return serviceName;
      }
    }

    const serviceNameLower = serviceName.toLowerCase().trim();

    // Try to find an exact match first
    const translationKey = this.serviceNameMap.get(serviceNameLower);
    if (translationKey) {
      return this.translationService.get(translationKey);
    }

    // Try to find a partial match
    for (const [key, value] of this.serviceNameMap.entries()) {
      if (serviceNameLower.includes(key) || key.includes(serviceNameLower)) {
        return this.translationService.get(value);
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
}
