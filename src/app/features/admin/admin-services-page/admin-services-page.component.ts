import { UserService } from './../../../core/services/user.service';
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
import { ConfirmationPopupComponent, type ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { ServiceCardComponent } from '../../../shared/components/service-card/service-card.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/components/inputs/input-textarea/input-textarea.component';
import { InputSelectComponent } from '../../../shared/components/inputs/input-select/input-select.component';
import { InputNumberComponent } from '../../../shared/components/inputs/input-number/input-number.component';
import { InputCheckboxComponent } from '../../../shared/components/inputs/input-checkbox/input-checkbox.component';
import { PopupDialogComponent, PopupDialogConfig } from '../../../shared/components/popup-dialog/popup-dialog.component';

import { FirebaseServicesService, ServiceCategory } from '../../../core/services/firebase-services.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FirebaseService } from '../../../core/services/firebase-services.service';

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
    ConfirmationPopupComponent,
    ServiceCardComponent,
    ButtonComponent,
    InputTextComponent,
    InputTextareaComponent,
    InputSelectComponent,
    InputNumberComponent,
    InputCheckboxComponent,
    PopupDialogComponent,
  ],
  templateUrl: './admin-services-page.component.html',
  styleUrls: ['./admin-services-page.component.scss'],
})
export class AdminServicesPageComponent implements OnInit {
  // Inject services
  private readonly router = inject(Router);
  private readonly firebaseServicesService = inject(FirebaseServicesService);
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
  private readonly _alertData = signal<ConfirmationData | null>(null);
  private readonly _pendingDeleteService = signal<FirebaseService | null>(null);
  private readonly _pendingDeleteCategory = signal<ServiceCategory | null>(null);

  // Service popular status signals - reactive state for each service
  private readonly _servicePopularStatus = signal<Map<string, boolean>>(new Map());

  // Form signals
  private readonly serviceFormSignal = signal<FormGroup | null>(null);
  private readonly categoryFormSignal = signal<FormGroup | null>(null);
  readonly serviceForm = computed(() => this.serviceFormSignal());
  readonly categoryForm = computed(() => this.categoryFormSignal());

  // Computed signals
  readonly services = computed(() => this.firebaseServicesService.services());
  readonly isLoading = computed(() => this.firebaseServicesService.isLoading());
  readonly showCreateDialog = computed(() => this._showCreateDialog());
  readonly showEditDialog = computed(() => this._showEditDialog());
  readonly selectedService = computed(() => this._selectedService());
  readonly showCreateCategoryDialog = computed(() => this._showCreateCategoryDialog());
  readonly showEditCategoryDialog = computed(() => this._showEditCategoryDialog());
  readonly showCategoriesManagerDialog = computed(() => this._showCategoriesManagerDialog());
  readonly selectedCategory = computed(() => this._selectedCategory());
  readonly showAlertDialog = computed(() => this._alertData());
  readonly alertData = computed(() => this._alertData());

  // Admin access signals
  readonly isAdmin = computed(() => this.userService.isAdmin());

  // Service categories
  readonly serviceCategories = computed(() => this.firebaseServicesService.serviceCategories());

  // Category options for form
  readonly categoryOptions = computed(() =>
    this.serviceCategories().map(category => ({
      label: this.translateService.instant(category.name),
      value: category.id,
      icon: category.icon
    }))
  );

  // Icon options
  readonly iconOptions = [
    { label: '✂️ Talla', value: '✂️' },
    { label: '🧔 Barba', value: '🧔' },
    { label: '💆 Tractament', value: '💆' },
    { label: '💇 Estil', value: '💇' },
    { label: '🎨 Coloració', value: '🎨' },
    { label: '⭐ Especial', value: '⭐' },
    { label: '👶 Nens', value: '👶' },
    { label: '🔧 General', value: '🔧' },
    { label: '💇‍♀️ Dona', value: '💇‍♀️' },
    { label: '💇‍♂️ Home', value: '💇‍♂' },
    { label: '💅 Manicura', value: '💅' },
    { label: '💄 Maquillatge', value: '💄' },
    { label: '🧴 Productes', value: '🧴' },
    { label: '✨ Glamour', value: '✨' },
    { label: '🌟 Premium', value: '🌟' },
    { label: '💎 Luxe', value: '💎' },
    { label: '🎯 Express', value: '🎯' },
    { label: '🕐 Ràpid', value: '🕐' },
    { label: '🌿 Natural', value: '🌿' },
    { label: '🔥 Tendència', value: '🔥' },
  ];

  // Services by category with reactive popular status
  readonly servicesByCategory = computed(() => {
    const services = this.firebaseServicesService.servicesByCategory();
    const popularStatus = this._servicePopularStatus();

    return services.map(category => ({
      ...category,
      services: category.services.map(service => ({
        ...service,
        isPopular: popularStatus.get(service.id!) ?? service.isPopular
      }))
    }));
  });

  // Computed properties for popup configurations
  readonly createServiceDialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('SERVICES.MANAGEMENT.CREATE_SERVICE'),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('SERVICES.MANAGEMENT.CREATE_SERVICE'),
        severity: 'primary',
        action: () => this.createService()
      }
    ]
  }));

  readonly editServiceDialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('SERVICES.MANAGEMENT.EDIT_SERVICE'),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('SERVICES.MANAGEMENT.EDIT_SERVICE'),
        severity: 'primary',
        action: () => this.updateService()
      }
    ]
  }));

  readonly categoriesManagerDialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.MANAGE_CATEGORIES'),
    size: 'large',
    closeOnBackdropClick: true,
    showFooter: false
  }));

  readonly createCategoryDialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CREATE_CATEGORY'),
    size: 'medium',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CREATE_CATEGORY'),
        severity: 'primary',
        action: () => this.createCategory()
      }
    ]
  }));

  readonly editCategoryDialogConfig = computed<PopupDialogConfig>(() => ({
    title: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.EDIT_CATEGORY'),
    size: 'medium',
    closeOnBackdropClick: true,
    showFooter: true,
    footerActions: [
      {
        label: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.EDIT_CATEGORY'),
        severity: 'primary',
        action: () => this.updateCategory()
      }
    ]
  }));

  constructor() {
  }

  ngOnInit() {
    this.initializeForms();
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
      isPopular: [false]
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

    // Initialize popular status signals after services are loaded
    const services = this.services();
    const statusMap = new Map<string, boolean>();
    services.forEach(service => {
      statusMap.set(service.id!, service.isPopular ?? false);
    });
    this._servicePopularStatus.set(statusMap);
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
        isPopular: service.isPopular ?? false
      });
    }
  }

  async createService(): Promise<void> {
    const form = this.serviceForm();
    if (!form?.valid) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.VALIDATION.NAME_REQUIRED')
      );
      return;
    }

    try {
      const formValue = form.value as {
        name: string;
        description: string;
        price: number;
        duration: number;
        category: string;
        icon: string;
        isPopular?: boolean;
      };
      const serviceData = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        duration: formValue.duration,
        category: formValue.category,
        icon: formValue.icon,
        isPopular: Boolean(formValue.isPopular),
      } satisfies Omit<FirebaseService, 'id'>;

      await this.firebaseServicesService.createService(serviceData);
      this.toastService.showSuccess(
        this.translateService.instant('SERVICES.MANAGEMENT.SERVICE_CREATED'),
        this.translateService.instant('SERVICES.MANAGEMENT.SERVICE_CREATED_MESSAGE')
      );
      this.cancelDialog();
    } catch (error) {
      console.error('Error creating service:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.CREATE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.ERROR_CREATING_SERVICE')
      );
    }
  }

  async updateService(): Promise<void> {
    const form = this.serviceForm();
    const selectedService = this.selectedService();

    if (!form?.valid || !selectedService) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.VALIDATION.NAME_REQUIRED')
      );
      return;
    }

    try {
      const formValue = form.value as {
        name: string;
        description: string;
        price: number;
        duration: number;
        category: string;
        icon: string;
        isPopular?: boolean;
      };
      const serviceData: Partial<FirebaseService> = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        duration: formValue.duration,
        category: formValue.category,
        icon: formValue.icon,
        isPopular: Boolean(formValue.isPopular),
      };

      await this.firebaseServicesService.updateService(selectedService.id!, serviceData);
      this.toastService.showSuccess(
        this.translateService.instant('SERVICES.MANAGEMENT.SERVICE_UPDATED'),
        this.translateService.instant('SERVICES.MANAGEMENT.SERVICE_UPDATED_MESSAGE')
      );
      this.cancelDialog();
    } catch (error) {
      console.error('Error updating service:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.UPDATE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.ERROR_UPDATING_SERVICE')
      );
    }
  }

  deleteService(service: FirebaseService): void {
    this._pendingDeleteService.set(service);
    this._pendingDeleteCategory.set(null);
    this._alertData.set({
      title: this.translateService.instant('SERVICES.MANAGEMENT.DELETE_CONFIRMATION'),
      message: this.translateService.instant('SERVICES.MANAGEMENT.DELETE_CONFIRMATION_MESSAGE', { name: service.name }),
      confirmText: this.translateService.instant('SERVICES.MANAGEMENT.DELETE_CONFIRMATION'),
      cancelText: this.translateService.instant('COMMON.CONFIRMATION.NO'),
      severity: 'danger',
    });
    this._showAlertDialog.set(true);
  }

  onAlertConfirmed(): void {
    const service = this._pendingDeleteService();
    const category = this._pendingDeleteCategory();
    if (service) {
      this.deleteServiceConfirmed(service);
    } else if (category) {
      this.deleteCategoryConfirmed(category);
    }
    this._showAlertDialog.set(false);
    this._alertData.set(null);
    this._pendingDeleteService.set(null);
    this._pendingDeleteCategory.set(null);
  }

  onAlertCancelled(): void {
    this._showAlertDialog.set(false);
    this._alertData.set(null);
  }

  private async deleteServiceConfirmed(service: FirebaseService): Promise<void> {
    try {
      await this.firebaseServicesService.deleteService(service.id!);
      this.toastService.showSuccess(
        this.translateService.instant('SERVICES.MANAGEMENT.SERVICE_DELETED'),
        this.translateService.instant('SERVICES.MANAGEMENT.SERVICE_DELETED_MESSAGE', { name: service.name })
      );
    } catch (error) {
      console.error('Error deleting service:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.DELETE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.ERROR_DELETING_SERVICE')
      );
    }
  }

  private async deleteCategoryConfirmed(category: ServiceCategory): Promise<void> {
    try {
      await this.firebaseServicesService.deleteCategory(category.id);
      this.toastService.showSuccess(
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CATEGORY_DELETED'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CATEGORY_DELETED_MESSAGE', { name: category.name })
      );
      this.closeCategoriesManager();
    } catch (error) {
      console.error('Error deleting category:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.DELETE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.ERROR_DELETING_CATEGORY')
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
        isPopular: false
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
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.VALIDATION.CATEGORY_NAME_REQUIRED')
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
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CATEGORY_UPDATED'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CATEGORY_UPDATED_MESSAGE')
      );
      this.cancelCategoryDialog();
    } catch (error) {
      console.error('Error updating category:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.UPDATE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.ERROR_UPDATING_CATEGORY')
      );
    }
  }

  async createCategory(): Promise<void> {
    const form = this.categoryForm();
    if (!form?.valid) {
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.VALIDATION_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.VALIDATION.CATEGORY_NAME_REQUIRED')
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
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CATEGORY_CREATED'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.CATEGORY_CREATED_MESSAGE')
      );
      this.cancelCategoryDialog();
    } catch (error) {
      console.error('Error creating category:', error);
      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.CREATE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.ERROR_CREATING_CATEGORY')
      );
    }
  }

  deleteCategory(category: ServiceCategory): void {
    this._pendingDeleteService.set(null);
    this._pendingDeleteCategory.set(category);
    this._alertData.set({
      title: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.DELETE_CATEGORY_CONFIRMATION'),
      message: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.DELETE_CATEGORY_CONFIRMATION_MESSAGE', { name: category.name }),
      confirmText: this.translateService.instant('SERVICES.MANAGEMENT.CATEGORIES.DELETE_CATEGORY_CONFIRMATION'),
      cancelText: this.translateService.instant('COMMON.CONFIRMATION.NO'),
      severity: 'danger',
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
      const newPopularStatus = !service.isPopular;

      // Update the reactive signal immediately for instant UI feedback
      this._servicePopularStatus.update(statusMap => {
        const newMap = new Map(statusMap);
        newMap.set(service.id!, newPopularStatus);
        return newMap;
      });

      // Prepare the update data
      const updatedService = {
        ...service,
        isPopular: newPopularStatus,
        updatedAt: new Date()
      };

      // Update in Firebase (without showing loader to avoid page reload feeling)
      await this.firebaseServicesService.updateService(service.id!, updatedService, false, false);

      const status = newPopularStatus ? 'POPULAR' : 'NO_POPULAR';
      this.toastService.showSuccess(
        this.translateService.instant('SERVICES.MANAGEMENT.POPULAR_STATUS_UPDATED'),
        this.translateService.instant('SERVICES.MANAGEMENT.POPULAR_STATUS_MESSAGE', {
          name: service.name,
          status: this.translateService.instant(`SERVICES.MANAGEMENT.STATUS.${status.toUpperCase()}`)
        })
      );
    } catch (error) {
      console.error('Error updating popular status:', error);

      // Revert the signal on error
      this._servicePopularStatus.update(statusMap => {
        const newMap = new Map(statusMap);
        newMap.set(service.id!, service.isPopular ?? false);
        return newMap;
      });

      this.toastService.showError(
        this.translateService.instant('COMMON.ERRORS.UPDATE_ERROR'),
        this.translateService.instant('SERVICES.MANAGEMENT.POPULAR_STATUS_ERROR_MESSAGE')
      );
    }
  }
}
