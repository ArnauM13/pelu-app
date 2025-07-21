import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { FirebaseServicesService, FirebaseService } from '../../../core/services/firebase-services.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'pelu-services-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TranslateModule, TagModule, CurrencyPipe],
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss']
})
export class ServicesPageComponent implements OnInit {
  // Inject services
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly translateService = inject(TranslateService);

  // Public computed signals - Use Firebase service directly
  readonly services = computed(() => this.firebaseServicesService.services());
  readonly isLoading = computed(() => this.firebaseServicesService.isLoading());
  readonly year = computed(() => new Date().getFullYear());

  // Services by category computed
  readonly servicesByCategory = computed(() =>
    this.firebaseServicesService.serviceCategories().map((category: any) => ({
      ...category,
      services: this.getServicesByCategory(category.id)
    }))
  );

  // Popular services computed
  readonly popularServices = computed(() =>
    this.services().filter(service => service.popular)
  );

  constructor() {}

  ngOnInit() {
    this.loadServices();
  }

  async loadServices() {
    try {
      await this.firebaseServicesService.loadServices();
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  // Get services and categories from the centralized service
  get allServices(): FirebaseService[] {
    return this.firebaseServicesService.services();
  }

  get allServiceCategories(): any[] {
    return this.firebaseServicesService.serviceCategories() || [];
  }

  getServicesByCategory(category: FirebaseService['category']): FirebaseService[] {
    return this.firebaseServicesService.getServicesByCategory(category);
  }

  getCategoryName(category: FirebaseService['category']): string {
    return this.firebaseServicesService.getCategoryName(category);
  }

  getCategoryIcon(category: FirebaseService['category']): string {
    return this.firebaseServicesService.getCategoryIcon(category);
  }

  // Loading configuration
  get loadingConfig() {
    return {
      message: 'COMMON.STATUS.LOADING',
      spinnerSize: 'large' as const,
      showMessage: true,
      fullHeight: true,
      overlay: true
    };
  }
}
