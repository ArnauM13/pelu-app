import { Injectable, inject, signal, computed, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
} from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';


export interface FirebaseService {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  icon: string;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface ServiceCategory {
  id: string; // Now supports any string ID
  name: string;
  icon: string;
  custom?: boolean; // Flag to identify custom categories
  createdAt?: unknown;
  createdBy?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseServicesService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly translateService = inject(TranslateService);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly isAdmin = this.roleService.isAdmin;

  // Core signals
  private readonly _services = signal<FirebaseService[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastSync = signal<number>(0);

  // Cache configuration - INCREASED CACHE DURATION
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (increased from 5)
  private readonly CACHE_KEY = 'pelu-services-cache';
  private readonly CACHE_TIMESTAMP_KEY = 'pelu-services-cache-timestamp';

  // Public computed signals
  readonly services = computed(() => this._services());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());
  readonly lastSync = computed(() => this._lastSync());

  // Service categories - static configuration
  private readonly _staticCategories: ServiceCategory[] = [
    { id: 'haircut', name: 'SERVICES.CATEGORIES.HAIRCUT', icon: '✂️' },
    { id: 'beard', name: 'SERVICES.CATEGORIES.BEARD', icon: '🧔' },
    { id: 'treatment', name: 'SERVICES.CATEGORIES.TREATMENT', icon: '💆' },
    { id: 'styling', name: 'SERVICES.CATEGORIES.STYLING', icon: '💇' },
    { id: 'coloring', name: 'SERVICES.CATEGORIES.COLORING', icon: '🎨' },
    { id: 'special', name: 'SERVICES.CATEGORIES.SPECIAL', icon: '⭐' },
    { id: 'kids', name: 'SERVICES.CATEGORIES.KIDS', icon: '👶' },
    { id: 'default', name: 'SERVICES.CATEGORIES.DEFAULT', icon: '🔧' },
  ];

  // Dynamic categories signal
  private readonly _customCategories = signal<ServiceCategory[]>([]);

  // Combined categories computed
  readonly serviceCategories = computed(() => [
    ...this._staticCategories,
    ...this._customCategories(),
  ]);

  // Computed signals for filtered services
  readonly activeServices = computed(() =>
    this.services().filter(service => service.isActive !== false)
  );

  readonly popularServices = computed(() =>
    this.activeServices().filter(service => service.isPopular)
  );

  readonly servicesByCategory = computed(() => {
    const services = this.activeServices();
    const categories = this.serviceCategories();

    return categories.map(category => ({
      ...category,
      services: services.filter(service => service.category === category.id),
    }));
  });

  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    // Wait for authentication to be initialized
    await this.waitForAuthInitialization();

    this.loadServicesFromCache();
    this.loadServices();
    this.loadCustomCategories();
  }

  /**
   * Wait for authentication to be initialized
   */
  private async waitForAuthInitialization(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkAuth = () => {
        if (this.authService.isInitialized()) {
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }

  /**
   * Load services from Firebase with cache management - OPTIMIZED
   */
  async loadServices(): Promise<void> {
    try {
      // Check if we need to refresh from Firebase
      if (this.shouldUseCache()) {
        return;
      }

      this._isLoading.set(true);
      this._error.set(null);

      const servicesRef = collection(this.firestore, 'services');
      const q = query(servicesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await runInInjectionContext(this.envInjector, () => getDocs(q));

      const services: FirebaseService[] = [];
      querySnapshot.forEach(doc => {
        const raw = { id: doc.id, ...doc.data() } as Record<string, unknown>;
        const service: FirebaseService = {
          id: String(raw['id']),
          name: String(raw['name']),
          description: String(raw['description']),
          price: Number(raw['price']),
          duration: Number(raw['duration']),
          category: String(raw['category']),
          icon: String(raw['icon']),
          isPopular: raw['isPopular'] === true,
          isActive: ((raw['isActive'] as boolean | undefined) ?? true) !== false,
        };
        const isActive = service.isActive !== false;
        if (isActive) services.push(service);
      });

      this._services.set(services);
      this._lastSync.set(Date.now());
      this.saveServicesToCache(services);

      // No background normalizations; only the new schema is supported

      this.logger.info('Services loaded from Firebase', {
        component: 'FirebaseServicesService',
        method: 'loadServices',
      });
    } catch (error) {
      this.logger.firebaseError(error, 'loadServices', {
        component: 'FirebaseServicesService',
        method: 'loadServices',
      });

      const errorMessage = error instanceof Error ? error.message : 'Error loading services';
      this._error.set(errorMessage);
      // Don't show toast for loading errors - they're not user-initiated actions
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Create a new service (admin only)
   */
  async createService(
    serviceData: Omit<FirebaseService, 'id'>,
    showToast: boolean = true
  ): Promise<FirebaseService | null> {
    try {
      // Check admin permissions
      if (!this.isAdmin()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);
      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Generate UUID v4 for the service ID (store as document ID and in the document itself)
      const generatedId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;

      const newService: FirebaseService = {
        ...serviceData,
        id: generatedId,
        isActive: true,
        isPopular: serviceData.isPopular ?? false,
      };

      // Save to Firestore with explicit ID and timestamps
      const docRef = doc(this.firestore, 'services', generatedId);
      await setDoc(docRef, {
        ...newService,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });

      // Update local state
      this._services.update(services => [newService, ...services]);
      this._lastSync.set(Date.now());
      this.saveServicesToCache(this._services());

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('serviceUpdated'));

      if (showToast) {
        this.toastService.showSuccess('COMMON.SERVICE_CREATED_SUCCESS');
      }
      this.logger.info('Service created', {
        component: 'FirebaseServicesService',
        method: 'createService',
        userId: currentUser.uid,
      });

      return newService;
    } catch (error) {
      this.logger.firebaseError(error, 'createService', {
        component: 'FirebaseServicesService',
        method: 'createService',
        userId: this.authService.user()?.uid,
      });

      const errorMessage = error instanceof Error ? error.message : 'Error creating service';
      this._error.set(errorMessage);
      if (showToast) {
        this.toastService.showGenericError('COMMON.ERROR_CREATING_SERVICE');
      }
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Update an existing service (admin only)
   */
  async updateService(
    serviceId: string,
    updates: Partial<FirebaseService>,
    showToast: boolean = true,
    showLoader: boolean = true
  ): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.isAdmin()) {
        throw new Error('Access denied - admin required');
      }

      if (showLoader) {
        this._isLoading.set(true);
      }
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      } as Partial<FirebaseService> & { updatedAt: unknown };

      // Update in Firestore
      const docRef = doc(this.firestore, 'services', serviceId);
      await updateDoc(docRef, updateData);

      // Update local state
      this._services.update(services =>
        services.map(service => (service.id === serviceId ? { ...service, ...updates } as FirebaseService : service))
      );
      this._lastSync.set(Date.now());

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('serviceUpdated'));
      this.saveServicesToCache(this._services());

      this.logger.info('Service updated', {
        component: 'FirebaseServicesService',
        method: 'updateService',
        userId: currentUser.uid,
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'updateService', {
        component: 'FirebaseServicesService',
        method: 'updateService',
        userId: this.authService.user()?.uid,
      });

      const errorMessage = error instanceof Error ? error.message : 'Error updating service';
      this._error.set(errorMessage);
      if (showToast) {
        this.toastService.showGenericError('COMMON.ERROR_UPDATING_SERVICE');
      }
      return false;
    } finally {
      if (showLoader) {
        this._isLoading.set(false);
      }
    }
  }

  /**
   * Delete a service (admin only) - soft delete by setting active to false
   */
  async deleteService(serviceId: string, showToast: boolean = true): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.isAdmin()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Soft delete by setting active to false (and keep isActive for legacy reads)
      const docRef = doc(this.firestore, 'services', serviceId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });

      // Remove from local state
      this._services.update(services => services.filter(service => service.id !== serviceId));
      this._lastSync.set(Date.now());
      this.saveServicesToCache(this._services());

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('serviceUpdated'));

      if (showToast) {
        this.toastService.showSuccess('COMMON.SERVICE_DELETED_SUCCESS');
      }
      this.logger.info('Service deleted', {
        component: 'FirebaseServicesService',
        method: 'deleteService',
        userId: currentUser.uid,
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'deleteService', {
        component: 'FirebaseServicesService',
        method: 'deleteService',
        userId: this.authService.user()?.uid,
      });

      const errorMessage = error instanceof Error ? error.message : 'Error deleting service';
      this._error.set(errorMessage);
      if (showToast) {
        this.toastService.showGenericError('COMMON.ERROR_DELETING_SERVICE');
      }
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get service by ID - OPTIMIZED to use cache first
   */
  async getServiceById(serviceId: string): Promise<FirebaseService | null> {
    try {
      // First check local cache
      const localService = this.services().find(service => service.id === serviceId);
      if (localService) {
        return localService;
      }

      // If not in cache and we have recent data, don't fetch individually
      if (this.shouldUseCache()) {
        return null;
      }

      // If not in cache, fetch from Firebase
      const docRef = doc(this.firestore, 'services', serviceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const service = { id: docSnap.id, ...docSnap.data() } as FirebaseService;
        const isActive = (service.isActive ?? true) !== false;
        return isActive ? { ...service, isActive } : null;
      }

      return null;
    } catch (error) {
      this.logger.firebaseError(error, 'getServiceById', {
        component: 'FirebaseServicesService',
        method: 'getServiceById',
      });
      return null;
    }
  }

  /**
   * Get services by category
   */
  getServicesByCategory(category: FirebaseService['category']): FirebaseService[] {
    return this.activeServices().filter(service => service.category === category);
  }

  /**
   * Get category name
   */
  getCategoryName(category: FirebaseService['category']): string {
    const categoryConfig = this.serviceCategories().find(cat => cat.id === category);
    const categoryKey = categoryConfig?.name || 'SERVICES.CATEGORIES.DEFAULT';

    try {
      return this.translateService.instant(categoryKey);
    } catch {
      return categoryKey;
    }
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: FirebaseService['category']): string {
    const categoryConfig = this.serviceCategories().find(cat => cat.id === category);
    return categoryConfig?.icon || '✂️';
  }

  /**
   * Refresh services from Firebase (force refresh)
   */
  async refreshServices(): Promise<void> {
    this.clearCache();
    await this.loadServices();
  }

  /**
   * One-time migration to new schema: ensure services only use isPopular and isActive fields
   * - Copies legacy fields (popular -> isPopular, active -> isActive)
   * - Ensures 'id' field matches document ID
   * - Removes legacy fields 'popular' and 'active'
   * Returns counts of updates performed
   */
  async migrateLegacyFieldsToNewSchema(): Promise<{ total: number; updated: number; skipped: number }> {
    if (!this.isAdmin()) {
      return { total: 0, updated: 0, skipped: 0 };
    }
    const servicesRef = collection(this.firestore, 'services');
    const snapshot = await runInInjectionContext(this.envInjector, () => getDocs(servicesRef));
    let updated = 0;
    let skipped = 0;
    const total = snapshot.size;

    for (const docSnap of snapshot.docs) {
      const raw = { id: docSnap.id, ...docSnap.data() } as Record<string, unknown>;

      const desiredIsPopular = (raw['isPopular'] === undefined)
        ? Boolean((raw['popular'] as boolean | undefined) ?? false)
        : Boolean(raw['isPopular']);
      const desiredIsActive = (raw['isActive'] === undefined)
        ? (((raw['active'] as boolean | undefined) ?? true) !== false)
        : Boolean(raw['isActive']);
      const desiredId = docSnap.id;

      const currentIsPopular = Boolean(raw['isPopular']);
      const currentIsActive = raw['isActive'] !== undefined ? Boolean(raw['isActive']) : undefined;
      const currentId = String(raw['id'] ?? '');

      const needsIsPopularUpdate = currentIsPopular !== desiredIsPopular;
      const needsIsActiveUpdate = currentIsActive === undefined || currentIsActive !== desiredIsActive;
      const needsIdUpdate = currentId !== desiredId;

      const updates: Partial<FirebaseService> & { [key: string]: unknown } = {};
      if (needsIsPopularUpdate) updates['isPopular'] = desiredIsPopular;
      if (needsIsActiveUpdate) updates['isActive'] = desiredIsActive;
      if (needsIdUpdate) updates['id'] = desiredId;
      // no-op: legacy fields are ignored in new app version
      if (Object.keys(updates).length > 0) {
        updates['updatedAt'] = serverTimestamp();
        const ref = doc(this.firestore, 'services', docSnap.id);
        await updateDoc(ref, updates as { [x: string]: import('@angular/fire/firestore').FieldValue | Partial<unknown> | undefined });
        updated++;
      } else {
        skipped++;
      }
    }

    // Refresh local cache/state if anything changed
    if (updated > 0) {
      await this.refreshServices();
    }

    return { total, updated, skipped };
  }

  // Development helper (removed): createSampleServices()

  /**
   * Check if we should use cache instead of fetching from Firebase - OPTIMIZED
   */
  private shouldUseCache(): boolean {
    const lastSync = this.lastSync();
    const now = Date.now();
    return lastSync > 0 && now - lastSync < this.CACHE_DURATION;
  }

  /**
   * Save services to local cache
   */
  private saveServicesToCache(services: FirebaseService[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(services));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch {
      this.logger.warn('Failed to save services to cache', {
        component: 'FirebaseServicesService',
        method: 'saveServicesToCache',
      });
    }
  }

  /**
   * Load services from local cache
   */
  private loadServicesFromCache(): void {
    try {
      const cachedServices = localStorage.getItem(this.CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);

      if (cachedServices && cacheTimestamp) {
        const parsed = JSON.parse(cachedServices) as Array<Record<string, unknown>>;
        const services: FirebaseService[] = parsed.map(raw => ({
          id: String(raw['id'] ?? ''),
          name: String(raw['name'] ?? ''),
          description: String(raw['description'] ?? ''),
          price: Number(raw['price'] ?? 0),
          duration: Number(raw['duration'] ?? 0),
          category: String(raw['category'] ?? ''),
          icon: String(raw['icon'] ?? ''),
          isPopular: Boolean(raw['isPopular'] === true),
          isActive: ((raw['isActive'] as boolean | undefined) ?? true) !== false,
        }));
        const timestamp = parseInt(cacheTimestamp, 10);
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < this.CACHE_DURATION) {
          this._services.set(services);
          this._lastSync.set(timestamp);
          this.logger.info('Services loaded from cache', {
            component: 'FirebaseServicesService',
            method: 'loadServicesFromCache',
          });
        }
      }
    } catch {
      this.logger.warn('Failed to load services from cache', {
        component: 'FirebaseServicesService',
        method: 'loadServicesFromCache',
      });
    }
  }

  /**
   * Clear local cache
   */
  private clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
    } catch {
      this.logger.warn('Failed to clear cache', {
        component: 'FirebaseServicesService',
        method: 'clearCache',
      });
    }
  }

  // ===== CATEGORY MANAGEMENT =====

  /**
   * Load custom categories from Firebase - OPTIMIZED with caching
   */
  private async loadCustomCategories(): Promise<void> {
    try {
      // Check if we have recent data
      if (this._customCategories().length > 0) {
        return;
      }

      const categoriesRef = collection(this.firestore, 'serviceCategories');
      const querySnapshot = await runInInjectionContext(this.envInjector, () => getDocs(categoriesRef));

      const customCategories: ServiceCategory[] = [];
      querySnapshot.forEach(doc => {
        const category = { id: doc.id, ...doc.data() } as ServiceCategory;
        customCategories.push(category);
      });

      this._customCategories.set(customCategories);
    } catch (error) {
      this.logger.firebaseError(error, 'loadCustomCategories', {
        component: 'FirebaseServicesService',
        method: 'loadCustomCategories',
      });
      // Set empty array if there's an error
      this._customCategories.set([]);
    }
  }

  /**
   * Get all categories (static + custom from Firebase) - OPTIMIZED
   */
  async getAllCategories(): Promise<ServiceCategory[]> {
    try {
      // Use cached categories if available
      const cachedCategories = this._customCategories();
      if (cachedCategories.length > 0) {
        return [...this._staticCategories, ...cachedCategories];
      }

      // Get custom categories from Firebase only if not cached
      const categoriesRef = collection(this.firestore, 'serviceCategories');
      const querySnapshot = await runInInjectionContext(this.envInjector, () => getDocs(categoriesRef));

      const customCategories: ServiceCategory[] = [];
      querySnapshot.forEach(doc => {
        const category = { id: doc.id, ...doc.data() } as ServiceCategory;
        customCategories.push(category);
      });

      // Update cache
      this._customCategories.set(customCategories);

      // Combine static and custom categories
      return [...this._staticCategories, ...customCategories];
    } catch (error) {
      this.logger.firebaseError(error, 'getAllCategories', {
        component: 'FirebaseServicesService',
        method: 'getAllCategories',
      });
      // Return only static categories if there's an error
      return this._staticCategories;
    }
  }

  /**
   * Create a new custom category (admin only)
   */
  async createCategory(
    categoryData: { name: string; icon: string; id: string },
    showToast: boolean = true
  ): Promise<ServiceCategory | null> {
    try {
      // Check admin permissions
      if (!this.isAdmin()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Check if category ID already exists
      const existingCategories = await this.getAllCategories();
      const categoryExists = existingCategories.some(cat => cat.id === categoryData.id);
      if (categoryExists) {
        throw new Error('Category ID already exists');
      }

      const category = {
        ...categoryData,
        custom: true,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'serviceCategories'), category);

      // Create new category with ID
      const newCategory: ServiceCategory = {
        ...category,
        id: docRef.id,
      };

      // Update local categories
      this._customCategories.update(categories => [...categories, newCategory]);

      if (showToast) {
        this.toastService.showSuccess('COMMON.CATEGORY_CREATED_SUCCESS');
      }
      this.logger.info('Category created', {
        component: 'FirebaseServicesService',
        method: 'createCategory',
        userId: currentUser.uid,
      });

      return newCategory;
    } catch (error) {
      this.logger.firebaseError(error, 'createCategory', {
        component: 'FirebaseServicesService',
        method: 'createCategory',
        userId: this.authService.user()?.uid,
      });

      const errorMessage = error instanceof Error ? error.message : 'Error creating category';
      this._error.set(errorMessage);
      if (showToast) {
        this.toastService.showGenericError('COMMON.ERROR_CREATING_CATEGORY');
      }
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Update a custom category (admin only)
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<ServiceCategory>,
    showToast: boolean = true
  ): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.isAdmin()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Update in Firestore
      const docRef = doc(this.firestore, 'serviceCategories', categoryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update local categories
      this._customCategories.update(categories =>
        categories.map(category =>
          category.id === categoryId ? { ...category, ...updates } : category
        )
      );

      if (showToast) {
        this.toastService.showSuccess('COMMON.CATEGORY_UPDATED_SUCCESS');
      }
      this.logger.info('Category updated', {
        component: 'FirebaseServicesService',
        method: 'updateCategory',
        userId: currentUser.uid,
        data: JSON.stringify({ categoryId }),
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'updateCategory', {
        component: 'FirebaseServicesService',
        method: 'updateCategory',
        userId: this.authService.user()?.uid,
        data: JSON.stringify({ categoryId }),
      });

      const errorMessage = error instanceof Error ? error.message : 'Error updating category';
      this._error.set(errorMessage);
      if (showToast) {
        this.toastService.showGenericError('COMMON.ERROR_UPDATING_CATEGORY');
      }
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Delete a custom category (admin only)
   */
  async deleteCategory(categoryId: string, showToast: boolean = true): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.isAdmin()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Check if category is being used by any services
      const servicesUsingCategory = this.services().filter(
        service => service.category === categoryId
      );
      if (servicesUsingCategory.length > 0) {
        throw new Error(
          `Cannot delete category: ${servicesUsingCategory.length} services are using it`
        );
      }

      // Delete from Firestore
      await deleteDoc(doc(this.firestore, 'serviceCategories', categoryId));

      // Update local categories
      this._customCategories.update(categories => categories.filter(cat => cat.id !== categoryId));

      if (showToast) {
        this.toastService.showSuccess('COMMON.CATEGORY_DELETED_SUCCESS');
      }
      this.logger.info('Category deleted', {
        component: 'FirebaseServicesService',
        method: 'deleteCategory',
        userId: currentUser.uid,
        data: JSON.stringify({ categoryId }),
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'deleteCategory', {
        component: 'FirebaseServicesService',
        method: 'deleteCategory',
        userId: this.authService.user()?.uid,
        data: JSON.stringify({ categoryId }),
      });

      const errorMessage = error instanceof Error ? error.message : 'Error deleting category';
      this._error.set(errorMessage);
      if (showToast) {
        this.toastService.showGenericError('COMMON.ERROR_DELETING_CATEGORY');
      }
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }
}
