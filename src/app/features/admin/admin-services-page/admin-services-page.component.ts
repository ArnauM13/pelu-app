import { Component, computed, OnInit, signal, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FirebaseServicesService, FirebaseService } from '../../../core/services/firebase-services.service';
import { ServicesMigrationService } from '../../../core/services/services-migration.service';
import { UserService } from '../../../core/services/user.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'pelu-admin-services-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    CardComponent,
    LoadingStateComponent,
    CurrencyPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-services-page.component.html',
  styleUrls: ['./admin-services-page.component.scss']
})
export class AdminServicesPageComponent implements OnInit {
  // Inject services
  private readonly router = inject(Router);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly servicesMigrationService = inject(ServicesMigrationService);
  private readonly userService = inject(UserService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Core signals
  private readonly _services = signal<FirebaseService[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _showCreateDialog = signal<boolean>(false);
  private readonly _showEditDialog = signal<boolean>(false);
  private readonly _selectedService = signal<FirebaseService | null>(null);

  // Form signals
  private readonly _formData = signal<Partial<FirebaseService>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'haircut',
    icon: '✂️',
    popular: false
  });

  // Public computed signals
  readonly services = computed(() => this._services());
  readonly isLoading = computed(() => this._isLoading());
  readonly showCreateDialog = computed(() => this._showCreateDialog());
  readonly showEditDialog = computed(() => this._showEditDialog());
  readonly selectedService = computed(() => this._selectedService());
  readonly formData = computed(() => this._formData());

  // Admin access computed
  readonly isAdmin = computed(() => this.userService.isAdmin());
  readonly hasAdminAccess = computed(() => this.userService.hasAdminAccess());

  // Service categories computed
  readonly serviceCategories = computed(() => this.firebaseServicesService.serviceCategories);

  // Category options for dropdown
  readonly categoryOptions = computed(() =>
    this.serviceCategories().map(category => ({
      label: category.name,
      value: category.id,
      icon: category.icon
    }))
  );

  // Icon options
  readonly iconOptions = [
    { label: '✂️ Talla', value: '✂️' },
    { label: '🧔 Barba', value: '🧔' },
    { label: '💆 Tractament', value: '💆' },
    { label: '💇 Estilitzat', value: '💇' },
    { label: '🎨 Coloració', value: '🎨' },
    { label: '👶 Infantil', value: '👶' },
    { label: '⭐ Especial', value: '⭐' },
    { label: '🔧 General', value: '🔧' }
  ];

  // Services by category computed
  readonly servicesByCategory = computed(() =>
    this.serviceCategories().map(category => ({
      ...category,
      services: this.getServicesByCategory(category.id)
    }))
  );

  constructor() {
    // Check admin access
    if (!this.hasAdminAccess()) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngOnInit() {
    this.loadServices();
  }

  /**
   * Load services from Firebase
   */
  async loadServices(): Promise<void> {
    this._isLoading.set(true);

    try {
      await this.firebaseServicesService.loadServices();
      this._services.set(this.firebaseServicesService.services());
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Show create service dialog
   */
  showCreateService(): void {
    this.resetForm();
    this._showCreateDialog.set(true);
  }

  /**
   * Show edit service dialog
   */
  showEditService(service: FirebaseService): void {
    this._selectedService.set(service);
    this._formData.set({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      icon: service.icon,
      popular: service.popular || false
    });
    this._showEditDialog.set(true);
  }

  /**
   * Create new service
   */
  async createService(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    const serviceData = this.formData();
    const newService = await this.firebaseServicesService.createService(serviceData as Omit<FirebaseService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>);

    if (newService) {
      this._services.set(this.firebaseServicesService.services());
      this._showCreateDialog.set(false);
      this.resetForm();
      this.messageService.add({
        severity: 'success',
        summary: 'Servei creat',
        detail: 'El servei s\'ha creat correctament'
      });
    }
  }

  /**
   * Update existing service
   */
  async updateService(): Promise<void> {
    if (!this.validateForm() || !this.selectedService()) {
      return;
    }

    const serviceData = this.formData();
    const success = await this.firebaseServicesService.updateService(this.selectedService()!.id!, serviceData);

    if (success) {
      this._services.set(this.firebaseServicesService.services());
      this._showEditDialog.set(false);
      this.resetForm();
      this._selectedService.set(null);
      this.messageService.add({
        severity: 'success',
        summary: 'Servei actualitzat',
        detail: 'El servei s\'ha actualitzat correctament'
      });
    }
  }

  /**
   * Delete service
   */
  deleteService(service: FirebaseService): void {
    this.confirmationService.confirm({
      message: `Estàs segur que vols eliminar el servei "${service.name}"?`,
      header: 'Confirmar eliminació',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const success = await this.firebaseServicesService.deleteService(service.id!);
        if (success) {
          this._services.set(this.firebaseServicesService.services());
          this.messageService.add({
            severity: 'success',
            summary: 'Servei eliminat',
            detail: 'El servei s\'ha eliminat correctament'
          });
        }
      }
    });
  }

  /**
   * Cancel dialog
   */
  cancelDialog(): void {
    this._showCreateDialog.set(false);
    this._showEditDialog.set(false);
    this.resetForm();
    this._selectedService.set(null);
  }

  /**
   * Handle create dialog visibility change
   */
  onCreateDialogVisibilityChange(visible: boolean): void {
    this._showCreateDialog.set(visible);
  }

  /**
   * Handle edit dialog visibility change
   */
  onEditDialogVisibilityChange(visible: boolean): void {
    this._showEditDialog.set(visible);
  }

  /**
   * Reset form data
   */
  private resetForm(): void {
    this._formData.set({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: 'haircut',
      icon: '✂️',
      popular: false
    });
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    const formData = this.formData();

    if (!formData.name || formData.name.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validació',
        detail: 'El nom del servei és obligatori'
      });
      return false;
    }

    if (!formData.description || formData.description.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validació',
        detail: 'La descripció del servei és obligatòria'
      });
      return false;
    }

    if (!formData.price || formData.price <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validació',
        detail: 'El preu ha de ser major que 0'
      });
      return false;
    }

    if (!formData.duration || formData.duration <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validació',
        detail: 'La durada ha de ser major que 0'
      });
      return false;
    }

    return true;
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: FirebaseService['category']): FirebaseService[] {
    return this.services().filter(service => service.category === category);
  }

  /**
   * Get category name
   */
  getCategoryName(category: FirebaseService['category']): string {
    return this.firebaseServicesService.getCategoryName(category);
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: FirebaseService['category']): string {
    return this.firebaseServicesService.getCategoryIcon(category);
  }

  /**
   * Refresh services
   */
  async refreshServices(): Promise<void> {
    await this.firebaseServicesService.refreshServices();
    this._services.set(this.firebaseServicesService.services());
  }

  /**
   * Migrate services from old service to Firebase
   */
  async migrateServices(): Promise<void> {
    const needsMigration = await this.servicesMigrationService.isMigrationNeeded();

    if (!needsMigration) {
      this.messageService.add({
        severity: 'info',
        summary: 'Migració no necessària',
        detail: 'Els serveis ja estan migrats a Firebase'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Vols migrar els serveis actuals a Firebase? Aquesta acció no es pot desfer.',
      header: 'Confirmar migració',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const success = await this.servicesMigrationService.migrateServicesToFirebase();
        if (success) {
          // Refresh services after migration
          await this.refreshServices();
        }
      }
    });
  }

  /**
   * Loading configuration
   */
  get loadingConfig() {
    return {
      message: 'COMMON.STATUS.LOADING',
      spinnerSize: 'large' as const,
      showMessage: true,
      fullHeight: false
    };
  }
}
