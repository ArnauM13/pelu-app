import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { FirebaseServicesService, type FirebaseService, type ServiceCategory } from '../../../core/services/firebase-services.service';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'pelu-about-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, ServiceCardComponent, AnimateOnScrollModule],
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss'],
})
export class AboutPageComponent implements OnInit {
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly loaderService = inject(LoaderService);

  readonly services = computed(() => this.firebaseServicesService.services());

  readonly servicesByCategory = computed(
    () =>
      this.firebaseServicesService
        .serviceCategories()
        .map((category: ServiceCategory) => ({
          ...category,
          services: this.getServicesByCategory(category.id),
        }))
        .filter(category => category.services.length > 0)
  );

  ngOnInit(): void {
    this.loadServices();
  }

  async loadServices() {
    this.loaderService.show({ message: 'ABOUT.LOADING_SERVICES' });

    try {
      await this.firebaseServicesService.loadServices();
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      this.loaderService.hide();
    }
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
}


