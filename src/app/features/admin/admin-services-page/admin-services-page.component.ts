import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import {
  FirebaseServicesService,
  FirebaseService,
} from '../../../core/services/firebase-services.service';
import { ServicesMigrationService } from '../../../core/services/services-migration.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import {
  AlertPopupComponent,
  AlertData,
} from '../../../shared/components/alert-popup/alert-popup.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import {
  InputTextareaComponent,
  InputSelectComponent,
  InputNumberComponent,
  InputCheckboxComponent,
} from '../../../shared/components/inputs';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'pelu-admin-services-page',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    LoadingStateComponent,
    AlertPopupComponent,
    ServiceCardComponent,
    InputTextareaComponent,
    InputSelectComponent,
    InputNumberComponent,
    InputCheckboxComponent,
    CurrencyPipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-services-page.component.html',
  styleUrls: ['./admin-services-page.component.scss'],
})
export class AdminServicesPageComponent implements OnInit {
  // Inject services
  private readonly router = inject(Router);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly servicesMigrationService = inject(ServicesMigrationService);
  private readonly userService = inject(UserService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  // Core signals - Use Firebase service directly for all data
  private readonly _showCreateDialog = signal<boolean>(false);
  private readonly _showEditDialog = signal<boolean>(false);
  private readonly _selectedService = signal<FirebaseService | null>(null);
  private readonly _showCreateCategoryDialog = signal<boolean>(false);
  private readonly _showEditCategoryDialog = signal<boolean>(false);
  private readonly _showCategoriesManagerDialog = signal<boolean>(false);
  private readonly _selectedCategory = signal<any>(null);
  private readonly _showAlertDialog = signal<boolean>(false);
  private readonly _alertData = signal<AlertData | null>(null);

  // Form signals
  private readonly _formData = signal<Partial<FirebaseService>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'haircut',
    icon: '✂️',
    popular: false,
  });

  // Category form signals
  private readonly _categoryFormData = signal<{ name: string; icon: string; id: string }>({
    name: '',
    icon: '🔧',
    id: '',
  });

  // Public computed signals - Use Firebase service directly
  readonly services = computed(() => this.firebaseServicesService.services());
  readonly isLoading = computed(() => this.firebaseServicesService.isLoading());
  readonly showCreateDialog = computed(() => this._showCreateDialog());
  readonly showEditDialog = computed(() => this._showEditDialog());
  readonly selectedService = computed(() => this._selectedService());
  readonly formData = computed(() => this._formData());
  readonly showCreateCategoryDialog = computed(() => this._showCreateCategoryDialog());
  readonly showEditCategoryDialog = computed(() => this._showEditCategoryDialog());
  readonly showCategoriesManagerDialog = computed(() => this._showCategoriesManagerDialog());
  readonly selectedCategory = computed(() => this._selectedCategory());
  readonly categoryFormData = computed(() => this._categoryFormData());
  readonly showAlertDialog = computed(() => this._showAlertDialog());
  readonly alertData = computed(() => this._alertData());

  // Admin access computed
  readonly isAdmin = computed(() => this.userService.isAdmin());
  readonly hasAdminAccess = computed(() => this.userService.hasAdminAccess());

  // Service categories computed
  readonly serviceCategories = computed(() => this.firebaseServicesService.serviceCategories());

  // Category options for dropdown
  readonly categoryOptions = computed(() =>
    this.serviceCategories().map(category => ({
      label: category.custom
        ? category.name
        : this.translateService.instant(`SERVICES.CATEGORIES.${category.id.toUpperCase()}`),
      value: category.id,
      icon: category.icon,
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
    { label: '🔧 General', value: '🔧' },
  ];

  // Services by category computed - Use Firebase service directly
  readonly servicesByCategory = computed(() => this.firebaseServicesService.servicesByCategory());

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
    try {
      await this.firebaseServicesService.loadServices();
    } catch (error) {
      console.error('Error loading services:', error);
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
      popular: service.popular || false,
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
    const newService = await this.firebaseServicesService.createService(
      serviceData as Omit<FirebaseService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
      false
    );

    if (newService) {
      this._showCreateDialog.set(false);
      this.resetForm();
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
    const success = await this.firebaseServicesService.updateService(
      this.selectedService()!.id!,
      serviceData,
      false
    );

    if (success) {
      this._showEditDialog.set(false);
      this.resetForm();
      this._selectedService.set(null);
    }
  }

  /**
   * Delete service
   */
  deleteService(service: FirebaseService): void {
    const alertData: AlertData = {
      title: this.translateService.instant('ADMIN.SERVICES.DELETE_CONFIRMATION'),
      message: this.translateService.instant('ADMIN.SERVICES.DELETE_CONFIRMATION_MESSAGE', {
        name: service.name,
      }),
      emoji: '⚠️',
      severity: 'danger',
      confirmText: this.translateService.instant('COMMON.ACTIONS.YES'),
      cancelText: this.translateService.instant('COMMON.ACTIONS.NO'),
    };

    this._alertData.set(alertData);
    this._showAlertDialog.set(true);
  }

  /**
   * Handle alert confirmation
   */
  onAlertConfirmed(): void {
    const service = this.selectedService();
    const category = this.selectedCategory();

    if (service) {
      this.deleteServiceConfirmed(service);
    } else if (category) {
      this.deleteCategoryConfirmed(category);
    }

    this._showAlertDialog.set(false);
  }

  /**
   * Handle alert cancellation
   */
  onAlertCancelled(): void {
    this._showAlertDialog.set(false);
    this._selectedService.set(null);
  }

  /**
   * Delete service confirmed
   */
  private async deleteServiceConfirmed(service: FirebaseService): Promise<void> {
    const success = await this.firebaseServicesService.deleteService(service.id!, false);
    if (success) {
      // Show success message after a short delay
      setTimeout(() => {
        this.toastService.showSuccess(
          this.translateService.instant('ADMIN.SERVICES.SERVICE_DELETED'),
          this.translateService.instant('ADMIN.SERVICES.SERVICE_DELETED_MESSAGE')
        );
      }, 300);
    }
  }

  /**
   * Delete category confirmed
   */
  private async deleteCategoryConfirmed(category: any): Promise<void> {
    const success = await this.firebaseServicesService.deleteCategory(category.id, false);
    if (success) {
      // Show success message after a short delay
      setTimeout(() => {
        this.toastService.showSuccess(
          this.translateService.instant('ADMIN.SERVICES.CATEGORIES.CATEGORY_DELETED'),
          this.translateService.instant('ADMIN.SERVICES.CATEGORIES.CATEGORY_DELETED_MESSAGE')
        );
      }, 300);
    }
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
      popular: false,
    });
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    const formData = this.formData();

    if (!formData.name || formData.name.trim() === '') {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.NAME_REQUIRED')
      );
      return false;
    }

    if (!formData.description || formData.description.trim() === '') {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.DESCRIPTION_REQUIRED')
      );
      return false;
    }

    if (!formData.category) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.CATEGORY_REQUIRED')
      );
      return false;
    }

    if (!formData.price || formData.price <= 0) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.PRICE_MIN')
      );
      return false;
    }

    if (!formData.duration || formData.duration < 5) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.DURATION_MIN')
      );
      return false;
    }

    if (formData.duration > 480) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.DURATION_MAX')
      );
      return false;
    }

    return true;
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: FirebaseService['category']): FirebaseService[] {
    return this.firebaseServicesService.getServicesByCategory(category);
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
  }

  /**
   * Migrate services from old service to Firebase
   */
  async migrateServices(): Promise<void> {
    const needsMigration = await this.servicesMigrationService.isMigrationNeeded();

    if (!needsMigration) {
      this.toastService.showInfo(
        this.translateService.instant('COMMON.STATUS.STATUS_INFO'),
        'Els serveis ja estan migrats a Firebase'
      );
      return;
    }

    this.confirmationService.confirm({
      message: 'Vols migrar els serveis actuals a Firebase? Aquesta acció no es pot desfer.',
      header: this.translateService.instant('ADMIN.SERVICES.MIGRATE_SERVICES'),
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const success = await this.servicesMigrationService.migrateServicesToFirebase();
        if (success) {
          // Refresh services after migration
          await this.refreshServices();
        }
      },
    });
  }

  /**
   * Show categories manager dialog
   */
  showCategoriesManager(): void {
    this._showCategoriesManagerDialog.set(true);
  }

  /**
   * Loading configuration
   */
  get loadingConfig() {
    return {
      message: 'COMMON.STATUS.LOADING',
      spinnerSize: 'large' as const,
      showMessage: true,
      fullHeight: false,
    };
  }

  // ===== CATEGORY MANAGEMENT =====

  /**
   * Show create category dialog
   */
  showCreateCategory(): void {
    this.resetCategoryForm();
    this._showCreateCategoryDialog.set(true);
  }

  /**
   * Show edit category dialog
   */
  showEditCategory(category: any): void {
    this._selectedCategory.set(category);
    this._categoryFormData.set({
      name: category.name,
      icon: category.icon,
      id: category.id,
    });
    this._showEditCategoryDialog.set(true);
  }

  /**
   * Update existing category
   */
  async updateCategory(): Promise<void> {
    if (!this.validateCategoryForm() || !this.selectedCategory()) {
      return;
    }

    const categoryData = this.categoryFormData();
    const success = await this.firebaseServicesService.updateCategory(
      this.selectedCategory()!.id,
      {
        name: categoryData.name,
        icon: categoryData.icon,
      },
      false
    );

    if (success) {
      this._showEditCategoryDialog.set(false);
      this.resetCategoryForm();
      this._selectedCategory.set(null);
    }
  }

  /**
   * Create new category
   */
  async createCategory(): Promise<void> {
    if (!this.validateCategoryForm()) {
      return;
    }

    const categoryData = this.categoryFormData();
    const newCategory = await this.firebaseServicesService.createCategory(categoryData, false);

    if (newCategory) {
      this._showCreateCategoryDialog.set(false);
      this.resetCategoryForm();
    }
  }

  /**
   * Delete category
   */
  deleteCategory(category: any): void {
    const alertData: AlertData = {
      title: this.translateService.instant(
        'ADMIN.SERVICES.CATEGORIES.DELETE_CATEGORY_CONFIRMATION'
      ),
      message: this.translateService.instant(
        'ADMIN.SERVICES.CATEGORIES.DELETE_CATEGORY_CONFIRMATION_MESSAGE',
        { name: category.name }
      ),
      emoji: '⚠️',
      severity: 'danger',
      confirmText: this.translateService.instant('COMMON.ACTIONS.YES'),
      cancelText: this.translateService.instant('COMMON.ACTIONS.NO'),
    };

    this._alertData.set(alertData);
    this._showAlertDialog.set(true);
    this._selectedCategory.set(category);
  }

  /**
   * Cancel category dialog
   */
  cancelCategoryDialog(): void {
    this._showCreateCategoryDialog.set(false);
    this._showEditCategoryDialog.set(false);
    this._showCategoriesManagerDialog.set(false);
    this.resetCategoryForm();
    this._selectedCategory.set(null);
  }

  /**
   * Close categories manager dialog
   */
  closeCategoriesManager(): void {
    this._showCategoriesManagerDialog.set(false);
  }

  /**
   * Handle create category dialog visibility change
   */
  onCreateCategoryDialogVisibilityChange(visible: boolean): void {
    this._showCreateCategoryDialog.set(visible);
  }

  /**
   * Handle edit category dialog visibility change
   */
  onEditCategoryDialogVisibilityChange(visible: boolean): void {
    this._showEditCategoryDialog.set(visible);
  }

  /**
   * Reset category form data
   */
  private resetCategoryForm(): void {
    this._categoryFormData.set({
      name: '',
      icon: '🔧',
      id: '',
    });
  }

  /**
   * Validate category form data
   */
  private validateCategoryForm(): boolean {
    const formData = this.categoryFormData();

    if (!formData.name || formData.name.trim() === '') {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.CATEGORY_NAME_REQUIRED')
      );
      return false;
    }

    if (!formData.id || formData.id.trim() === '') {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.CATEGORY_ID_REQUIRED')
      );
      return false;
    }

    if (formData.id.length < 3) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.CATEGORY_ID_MIN_LENGTH')
      );
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(formData.id)) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.CATEGORY_ID_FORMAT')
      );
      return false;
    }

    if (!formData.icon || formData.icon.trim() === '') {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.CATEGORY_ICON_REQUIRED')
      );
      return false;
    }

    return true;
  }

  /**
   * Toggle popular status of a service
   */
  async togglePopularStatus(service: FirebaseService): Promise<void> {
    const newPopularStatus = !service.popular;
    await this.firebaseServicesService.updateService(
      service.id!,
      {
        popular: newPopularStatus,
      },
      false,
      false
    );
  }
}
