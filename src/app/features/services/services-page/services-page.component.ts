import { Component, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import {
  FirebaseServicesService,
  FirebaseService,
} from '../../../core/services/firebase-services.service';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { UserService } from '../../../core/services/user.service';

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  custom?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'pelu-services-page',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TranslateModule,
    TagModule,
    LoadingStateComponent,
    ServiceCardComponent,
    ButtonComponent,
  ],
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss'],
})
export class ServicesPageComponent implements OnInit {
  // Inject services
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  // Public computed signals - Use Firebase service directly
  readonly services = computed(() => this.firebaseServicesService.services());
  readonly isLoading = computed(() => this.firebaseServicesService.isLoading());
  readonly year = computed(() => new Date().getFullYear());

  // Admin access computed
  readonly isAdmin = computed(() => this.userService.isAdmin());

  // Services by category computed - only show categories with services
  readonly servicesByCategory = computed(
    () =>
      this.firebaseServicesService
        .serviceCategories()
        .map((category: ServiceCategory) => ({
          ...category,
          services: this.getServicesByCategory(category.id),
        }))
        .filter(category => category.services.length > 0) // Only show categories with services
  );

  // Popular services computed
  readonly popularServices = computed(() => this.services().filter(service => service.popular));

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

  // Navigation method for admin button
  navigateToAdminServices(): void {
    this.router.navigate(['/admin/services']);
  }

  // Get services and categories from the centralized service
  get allServices(): FirebaseService[] {
    return this.firebaseServicesService.services();
  }

  get allServiceCategories(): ServiceCategory[] {
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
      overlay: true,
    };
  }
}
