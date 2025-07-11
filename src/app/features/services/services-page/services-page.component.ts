import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { ServicesService, Service, ServiceCategory } from '../../../core/services/services.service';

@Component({
  selector: 'pelu-services-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TranslateModule, TagModule],
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss']
})
export class ServicesPageComponent implements OnInit {
  readonly year = computed(() => new Date().getFullYear());

  // Use signals for reactive data
  services = signal<Service[]>([]);
  serviceCategories = signal<ServiceCategory[]>([]);

  constructor(private servicesService: ServicesService) {}

  ngOnInit() {
    // Load services with proper translation handling
    this.servicesService.getServicesWithTranslatedNamesAsync().subscribe(services => {
      this.services.set(services);
    });

    // Load categories
    this.serviceCategories.set(this.servicesService.getServiceCategories());
  }

  // Get services and categories from the centralized service
  get allServices(): Service[] {
    return this.services();
  }

  get allServiceCategories(): ServiceCategory[] {
    return this.serviceCategories();
  }

  getServicesByCategory(category: Service['category']): Service[] {
    return this.services().filter(service => service.category === category);
  }

  getCategoryName(category: Service['category']): string {
    return this.servicesService.getCategoryName(category);
  }

  getCategoryIcon(category: Service['category']): string {
    return this.servicesService.getCategoryIcon(category);
  }

  // Booking functionality removed - services page is now informational only
}
