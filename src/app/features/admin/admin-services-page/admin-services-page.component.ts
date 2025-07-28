import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { AlertPopupComponent } from '../../../shared/components/alert-popup/alert-popup.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/components/inputs/input-textarea/input-textarea.component';
import { InputSelectComponent } from '../../../shared/components/inputs/input-select/input-select.component';
import { InputNumberComponent } from '../../../shared/components/inputs/input-number/input-number.component';
import { InputCheckboxComponent } from '../../../shared/components/inputs/input-checkbox/input-checkbox.component';
import { InputToggleSwitchComponent } from '../../../shared/components/inputs/input-toggleswitch/input-toggleswitch.component';

import { FirebaseServicesService } from '../../../core/services/firebase-services.service';
import { ServicesMigrationService } from '../../../core/services/services-migration.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FirebaseService } from '../../../core/services/firebase-services.service';

interface AlertData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  severity: 'warning' | 'danger';
  onConfirm: () => void;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  custom?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'pelu-admin-services-page',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    ButtonComponent,
    InputTextComponent,
    InputTextareaComponent,
    InputSelectComponent,
    InputNumberComponent,
    InputCheckboxComponent,
    InputToggleSwitchComponent,
  ],
  templateUrl: './admin-services-page.component.html',
  styleUrls: ['./admin-services-page.component.scss'],
})
export class AdminServicesPageComponent implements OnInit {
  // Inject services
  private readonly router = inject(Router);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly servicesMigrationService = inject(ServicesMigrationService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  // Dialog visibility signals
  private readonly _showCreateDialog = signal<boolean>(false);
  private readonly _showEditDialog = signal<boolean>(false);
  private readonly _selectedService = signal<FirebaseService | null>(null);
  private readonly _showCreateCategoryDialog = signal<boolean>(false);
  private readonly _showEditCategoryDialog = signal<boolean>(false);
  private readonly _showCategoriesManagerDialog = signal<boolean>(false);
  private readonly _selectedCategory = signal<ServiceCategory | null>(null);
  private readonly _showAlertDialog = signal<boolean>(false);
  private readonly _alertData = signal<AlertData | null>(null);

  // Reactive Forms
  private readonly serviceFormSignal = signal<FormGroup | null>(null);
  private readonly categoryFormSignal = signal<FormGroup | null>(null);
  readonly serviceForm = computed(() => this.serviceFormSignal());
  readonly categoryForm = computed(() => this.categoryFormSignal());

  // Public computed signals - Use Firebase service directly
  readonly services = computed(() => this.firebaseServicesService.services());
  readonly isLoading = computed(() => this.firebaseServicesService.isLoading());
  readonly showCreateDialog = computed(() => this._showCreateDialog());
  readonly showEditDialog = computed(() => this._showEditDialog());
  readonly selectedService = computed(() => this._selectedService());
  readonly showCreateCategoryDialog = computed(() => this._showCreateCategoryDialog());
  readonly showEditCategoryDialog = computed(() => this._showEditCategoryDialog());
  readonly showCategoriesManagerDialog = computed(() => this._showCategoriesManagerDialog());
  readonly selectedCategory = computed(() => this._selectedCategory());
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

  // Icon options with enhanced information for templates
  readonly iconOptions = [
    {
      label: '✂️ Talla',
      value: '✂️',
      description: 'Tall de cabell professional',
      category: 'Cabell',
      color: '#3b82f6',
      popular: true
    },
    {
      label: '🧔 Barba',
      value: '🧔',
      description: 'Arreglat i modelat de barba',
      category: 'Barba',
      color: '#8b5cf6',
      popular: false
    },
    {
      label: '💆 Tractament',
      value: '💆',
      description: 'Tractaments capil·lars',
      category: 'Tractament',
      color: '#10b981',
      popular: true
    },
    {
      label: '💇 Estilitzat',
      value: '💇',
      description: 'Estilització i arreglat',
      category: 'Estil',
      color: '#f59e0b',
      popular: false
    },
    {
      label: '🎨 Coloració',
      value: '🎨',
      description: 'Coloració i tintat',
      category: 'Color',
      color: '#ec4899',
      popular: true
    },
    {
      label: '💅 Manicure',
      value: '💅',
      description: 'Arreglat d\'ungles',
      category: 'Manicure',
      color: '#f97316',
      popular: false
    },
    {
      label: '🧖 Tractament Facial',
      value: '🧖',
      description: 'Tractaments facials',
      category: 'Facial',
      color: '#06b6d4',
      popular: false
    },
    {
      label: '💆 Massatge',
      value: '💆',
      description: 'Massatges relaxants',
      category: 'Massatge',
      color: '#8b5cf6',
      popular: false
    },
    {
      label: '🎭 Maquillatge',
      value: '🎭',
      description: 'Maquillatge professional',
      category: 'Maquillatge',
      color: '#ec4899',
      popular: false
    },
    {
      label: '💇‍♀️ Perruqueria',
      value: '💇‍♀️',
      description: 'Serveis deenery',
      category: 'Perruqueria',
      color: '#10b981',
      popular: false
    }
  ];

  // Services by category computed
  readonly servicesByCategory = computed(() => this.firebaseServicesService.servicesByCategory());

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadServices();
  }

  private initializeForms() {
    // Initialize service form
    const serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      category: ['haircut', [Validators.required]],
      icon: ['✂️', [Validators.required]],
      popular: [false],
      favorite: [false]
    });

    // Initialize category form
    const categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: ['🔧', [Validators.required]],
      id: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.serviceFormSignal.set(serviceForm);
    this.categoryFormSignal.set(categoryForm);
  }

  // Helper methods for form validation
  isServiceFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm()?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getServiceFieldError(fieldName: string): string {
    const field = this.serviceForm()?.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Aquest camp és obligatori';
      if (field.errors['minlength']) return `Mínim ${field.errors['minlength'].requiredLength} caràcters`;
      if (field.errors['min']) return `Valor mínim: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor màxim: ${field.errors['max'].max}`;
    }
    return '';
  }

  isCategoryFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm()?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getCategoryFieldError(fieldName: string): string {
    const field = this.categoryForm()?.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Aquest camp és obligatori';
      if (field.errors['minlength']) return `Mínim ${field.errors['minlength'].requiredLength} caràcters`;
    }
    return '';
  }

  async loadServices(): Promise<void> {
    await this.firebaseServicesService.loadServices();
  }

  showCreateService(): void {
    this.resetServiceForm();
    this._showCreateDialog.set(true);
  }

  showEditService(service: FirebaseService): void {
    this._selectedService.set(service);
    this.populateServiceForm(service);
    this._showEditDialog.set(true);
  }

  private populateServiceForm(service: FirebaseService) {
    const form = this.serviceForm();
    if (form) {
      form.patchValue({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        icon: service.icon,
        popular: service.popular,
        favorite: service.favorite
      });
    }
  }

  async createService(): Promise<void> {
    const form = this.serviceForm();
    if (!form?.valid) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.FORM_INVALID')
      );
      return;
    }

    try {
      const formValue = form.value;
      const serviceData = {
        ...formValue,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.firebaseServicesService.createService(serviceData);
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.CREATED_SUCCESS'),
        this.translateService.instant('ADMIN.SERVICES.CREATED_MESSAGE')
      );
      this.cancelDialog();
    } catch (error) {
      console.error('Error creating service:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.CREATE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CREATE_ERROR_MESSAGE')
      );
    }
  }

  async updateService(): Promise<void> {
    const form = this.serviceForm();
    const selectedService = this.selectedService();

    if (!form?.valid || !selectedService) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.VALIDATION.FORM_INVALID')
      );
      return;
    }

    try {
      const formValue = form.value;
      const serviceData = {
        ...formValue,
        updatedAt: new Date()
      };

      await this.firebaseServicesService.updateService(selectedService.id!, serviceData);
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.UPDATED_SUCCESS'),
        this.translateService.instant('ADMIN.SERVICES.UPDATED_MESSAGE')
      );
      this.cancelDialog();
    } catch (error) {
      console.error('Error updating service:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.UPDATE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.UPDATE_ERROR_MESSAGE')
      );
    }
  }

  deleteService(service: FirebaseService): void {
    this._alertData.set({
      title: this.translateService.instant('ADMIN.SERVICES.DELETE_CONFIRMATION_TITLE'),
      message: this.translateService.instant('ADMIN.SERVICES.DELETE_CONFIRMATION_MESSAGE', { name: service.name }),
      confirmText: this.translateService.instant('COMMON.ACTIONS.DELETE'),
      cancelText: this.translateService.instant('COMMON.ACTIONS.CANCEL'),
      severity: 'danger',
      onConfirm: () => this.deleteServiceConfirmed(service)
    });
    this._showAlertDialog.set(true);
  }

  onAlertConfirmed(): void {
    const alertData = this.alertData();
    if (alertData) {
      alertData.onConfirm();
    }
    this._showAlertDialog.set(false);
    this._alertData.set(null);
  }

  onAlertCancelled(): void {
    this._showAlertDialog.set(false);
    this._alertData.set(null);
  }

  private async deleteServiceConfirmed(service: FirebaseService): Promise<void> {
    try {
      await this.firebaseServicesService.deleteService(service.id!);
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.DELETED_SUCCESS'),
        this.translateService.instant('ADMIN.SERVICES.DELETED_MESSAGE', { name: service.name })
      );
    } catch (error) {
      console.error('Error deleting service:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.DELETE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.DELETE_ERROR_MESSAGE')
      );
    }
  }

  private async deleteCategoryConfirmed(category: ServiceCategory): Promise<void> {
    try {
      await this.firebaseServicesService.deleteCategory(category.id);
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.DELETED_SUCCESS'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.DELETED_MESSAGE', { name: category.name })
      );
      this.closeCategoriesManager();
    } catch (error) {
      console.error('Error deleting category:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.DELETE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.DELETE_ERROR_MESSAGE')
      );
    }
  }

  cancelDialog(): void {
    this._showCreateDialog.set(false);
    this._showEditDialog.set(false);
    this._selectedService.set(null);
    this.resetServiceForm();
  }

  onCreateDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.cancelDialog();
    }
  }

  onEditDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.cancelDialog();
    }
  }

  private resetServiceForm(): void {
    const form = this.serviceForm();
    if (form) {
      form.reset({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: 'haircut',
        icon: '✂️',
        popular: false,
        favorite: false
      });
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

  async refreshServices(): Promise<void> {
    await this.firebaseServicesService.refreshServices();
  }

  async migrateServices(): Promise<void> {
    try {
      this.toastService.showInfo(
        this.translateService.instant('ADMIN.SERVICES.MIGRATION.STARTED'),
        this.translateService.instant('ADMIN.SERVICES.MIGRATION.STARTED_MESSAGE')
      );

      const migratedCount = await this.servicesMigrationService.migrateServicesToFirebase();

      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.MIGRATION.COMPLETED'),
        this.translateService.instant('ADMIN.SERVICES.MIGRATION.COMPLETED_MESSAGE', { count: migratedCount })
      );

      await this.refreshServices();
    } catch (error) {
      console.error('Error migrating services:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.MIGRATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.MIGRATION.ERROR_MESSAGE')
      );
    }
  }

  showCategoriesManager(): void {
    this._showCategoriesManagerDialog.set(true);
  }

  get loadingConfig() {
    return {
      message: this.translateService.instant('ADMIN.SERVICES.LOADING_MESSAGE'),
      showSpinner: true,
      spinnerSize: 'large' as const,
      overlay: true,
      overlayOpacity: 0.7,
      zIndex: 1000
    };
  }

  showCreateCategory(): void {
    this.resetCategoryForm();
    this._showCreateCategoryDialog.set(true);
  }

  showEditCategory(category: ServiceCategory): void {
    this._selectedCategory.set(category);
    this.populateCategoryForm(category);
    this._showEditCategoryDialog.set(true);
  }

  private populateCategoryForm(category: ServiceCategory) {
    const form = this.categoryForm();
    if (form) {
      form.patchValue({
        name: category.name,
        icon: category.icon,
        id: category.id
      });
    }
  }

  async updateCategory(): Promise<void> {
    const form = this.categoryForm();
    const selectedCategory = this.selectedCategory();

    if (!form?.valid || !selectedCategory) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.FORM_INVALID')
      );
      return;
    }

    try {
      const formValue = form.value;
      const categoryData = {
        ...formValue,
        updatedAt: new Date()
      };

      await this.firebaseServicesService.updateCategory(selectedCategory.id, categoryData);
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.UPDATED_SUCCESS'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.UPDATED_MESSAGE')
      );
      this.cancelCategoryDialog();
    } catch (error) {
      console.error('Error updating category:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.UPDATE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.UPDATE_ERROR_MESSAGE')
      );
    }
  }

  async createCategory(): Promise<void> {
    const form = this.categoryForm();
    if (!form?.valid) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.VALIDATION.FORM_INVALID')
      );
      return;
    }

    try {
      const formValue = form.value;
      const categoryData = {
        ...formValue,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.firebaseServicesService.createCategory(categoryData);
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.CREATED_SUCCESS'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.CREATED_MESSAGE')
      );
      this.cancelCategoryDialog();
    } catch (error) {
      console.error('Error creating category:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.CREATE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.CATEGORIES.CREATE_ERROR_MESSAGE')
      );
    }
  }

  deleteCategory(category: ServiceCategory): void {
    this._alertData.set({
      title: this.translateService.instant('ADMIN.SERVICES.CATEGORIES.DELETE_CONFIRMATION_TITLE'),
      message: this.translateService.instant('ADMIN.SERVICES.CATEGORIES.DELETE_CONFIRMATION_MESSAGE', { name: category.name }),
      confirmText: this.translateService.instant('COMMON.ACTIONS.DELETE'),
      cancelText: this.translateService.instant('COMMON.ACTIONS.CANCEL'),
      severity: 'danger',
      onConfirm: () => this.deleteCategoryConfirmed(category)
    });
    this._showAlertDialog.set(true);
  }

  cancelCategoryDialog(): void {
    this._showCreateCategoryDialog.set(false);
    this._showEditCategoryDialog.set(false);
    this._selectedCategory.set(null);
    this.resetCategoryForm();
  }

  closeCategoriesManager(): void {
    this._showCategoriesManagerDialog.set(false);
  }

  onCreateCategoryDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.cancelCategoryDialog();
    }
  }

  onEditCategoryDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.cancelCategoryDialog();
    }
  }

  private resetCategoryForm(): void {
    const form = this.categoryForm();
    if (form) {
      form.reset({
        name: '',
        icon: '🔧',
        id: ''
      });
    }
  }

  async togglePopularStatus(service: FirebaseService): Promise<void> {
    try {
      const updatedService = {
        ...service,
        popular: !service.popular,
        updatedAt: new Date()
      };

      await this.firebaseServicesService.updateService(service.id!, updatedService);

      const status = updatedService.popular ? 'popular' : 'no popular';
      this.toastService.showSuccess(
        this.translateService.instant('ADMIN.SERVICES.POPULAR_STATUS_UPDATED'),
        this.translateService.instant('ADMIN.SERVICES.POPULAR_STATUS_MESSAGE', {
          name: service.name,
          status: this.translateService.instant(`ADMIN.SERVICES.STATUS.${status.toUpperCase()}`)
        })
      );
    } catch (error) {
      console.error('Error updating popular status:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.UPDATE_ERROR'),
        this.translateService.instant('ADMIN.SERVICES.POPULAR_STATUS_ERROR_MESSAGE')
      );
    }
  }
}
