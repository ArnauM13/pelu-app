import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';

export interface ServiceColor {
  id: string;
  translationKey: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceColorsService {
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

  constructor(private translationService: TranslationService) {
    // Inicialitzar el mapa de colors
    this.serviceColors.forEach(color => {
      this.serviceColorMap.set(color.id, color);
    });
  }

  /**
   * Obté el color d'un servei basat en el nom del servei
   */
  getServiceColor(serviceName: string): ServiceColor {
    if (!serviceName) {
      return this.getDefaultColor();
    }

    const serviceNameLower = serviceName.toLowerCase();

    // Mapeig de noms de serveis a IDs de colors
    if (
      serviceNameLower.includes('corte') ||
      serviceNameLower.includes('tall') ||
      serviceNameLower.includes('cabell')
    ) {
      return this.serviceColorMap.get('haircut') || this.getDefaultColor();
    }

    if (
      serviceNameLower.includes('peinat') ||
      serviceNameLower.includes('pentinat') ||
      serviceNameLower.includes('estil') ||
      serviceNameLower.includes('estilitzat')
    ) {
      return this.serviceColorMap.get('styling') || this.getDefaultColor();
    }

    if (
      serviceNameLower.includes('tractament') ||
      serviceNameLower.includes('màscara') ||
      serviceNameLower.includes('hidratació') ||
      serviceNameLower.includes('rentat')
    ) {
      return this.serviceColorMap.get('treatment') || this.getDefaultColor();
    }

    if (
      serviceNameLower.includes('color') ||
      serviceNameLower.includes('tint') ||
      serviceNameLower.includes('coloració')
    ) {
      return this.serviceColorMap.get('coloring') || this.getDefaultColor();
    }

    if (
      serviceNameLower.includes('especial') ||
      serviceNameLower.includes('event') ||
      serviceNameLower.includes('completa')
    ) {
      return this.serviceColorMap.get('special') || this.getDefaultColor();
    }

    if (
      serviceNameLower.includes('infantil') ||
      serviceNameLower.includes('nen') ||
      serviceNameLower.includes('nena') ||
      serviceNameLower.includes('infant')
    ) {
      return this.serviceColorMap.get('kids') || this.getDefaultColor();
    }

    return this.getDefaultColor();
  }

  /**
   * Obté el nom traduït d'un color de servei
   */
  getServiceColorName(serviceColor: ServiceColor): string {
    return this.translationService.get(serviceColor.translationKey);
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
