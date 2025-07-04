import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'haircut' | 'beard' | 'treatment' | 'styling';
  popular?: boolean;
}

@Component({
  selector: 'pelu-services-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TranslateModule, TagModule],
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss']
})
export class ServicesPageComponent {
  readonly year = computed(() => new Date().getFullYear());

  services: Service[] = [
    {
      id: '1',
      name: 'Corte de cabell masculí',
      description: 'Corte clàssic o modern segons les teves preferències',
      price: 25,
      duration: 30,
      category: 'haircut',
      popular: true
    },
    {
      id: '2',
      name: 'Corte + Afaitat',
      description: 'Corte complet amb afaitat de barba inclòs',
      price: 35,
      duration: 45,
      category: 'haircut'
    },
    {
      id: '3',
      name: 'Afaitat de barba',
      description: 'Afaitat tradicional amb navalla o màquina',
      price: 15,
      duration: 20,
      category: 'beard'
    },
    {
      id: '4',
      name: 'Arreglada de barba',
      description: 'Perfilat i arreglada de barba',
      price: 12,
      duration: 15,
      category: 'beard'
    },
    {
      id: '5',
      name: 'Lavada i tractament',
      description: 'Lavada professional amb productes de qualitat',
      price: 18,
      duration: 25,
      category: 'treatment'
    },
    {
      id: '6',
      name: 'Coloració',
      description: 'Coloració completa o retocs',
      price: 45,
      duration: 60,
      category: 'treatment'
    },
    {
      id: '7',
      name: 'Peinat especial',
      description: 'Peinat per a esdeveniments especials',
      price: 30,
      duration: 40,
      category: 'styling'
    },
    {
      id: '8',
      name: 'Corte infantil',
      description: 'Corte especialitzat per a nens',
      price: 18,
      duration: 25,
      category: 'haircut'
    }
  ];

  getServicesByCategory(category: Service['category']): Service[] {
    return this.services.filter(service => service.category === category);
  }

  getCategoryName(category: Service['category']): string {
    const categoryNames = {
      haircut: 'Cortes',
      beard: 'Barba',
      treatment: 'Tractaments',
      styling: 'Peinats'
    };
    return categoryNames[category];
  }

  getCategoryIcon(category: Service['category']): string {
    const categoryIcons = {
      haircut: '✂️',
      beard: '🧔',
      treatment: '💆',
      styling: '💇'
    };
    return categoryIcons[category];
  }

  onBookService(service: Service): void {
    // Navigate to booking page with service pre-selected
    // This would be implemented with router navigation
    console.log('Booking service:', service);
    // TODO: Implement navigation to booking page with service pre-selected
  }
}
