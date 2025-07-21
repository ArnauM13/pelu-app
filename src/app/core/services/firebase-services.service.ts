import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { RoleService } from './role.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';
import { v4 as uuidv4 } from 'uuid';

export interface FirebaseService {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string; // Now supports any string category
  icon: string;
  popular?: boolean;
  active?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface ServiceCategory {
  id: string; // Now supports any string ID
  name: string;
  icon: string;
  custom?: boolean; // Flag to identify custom categories
  createdAt?: any;
  createdBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly translateService = inject(TranslateService);

  // Core signals
  private readonly _services = signal<FirebaseService[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastSync = signal<number>(0);

  // Cache configuration
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
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
    { id: 'default', name: 'SERVICES.CATEGORIES.DEFAULT', icon: '🔧' }
  ];

  // Dynamic categories signal
  private readonly _customCategories = signal<ServiceCategory[]>([]);

  // Combined categories computed
  readonly serviceCategories = computed(() => [
    ...this._staticCategories,
    ...this._customCategories()
  ]);

  // Computed signals for filtered services
  readonly activeServices = computed(() =>
    this.services().filter(service => service.active !== false)
  );

  readonly popularServices = computed(() =>
    this.activeServices().filter(service => service.popular)
  );

  readonly servicesByCategory = computed(() => {
    const services = this.activeServices();
    const categories = this.serviceCategories();

    return categories.map(category => ({
      ...category,
      services: services.filter(service => service.category === category.id)
    }));
  });

  // Admin access computed
  readonly hasAdminAccess = computed(() => {
    const currentRole = this.roleService.userRole();
    return currentRole?.role === 'admin';
  });

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    this.loadServicesFromCache();
    this.loadServices();
    this.loadCustomCategories();
  }

  /**
   * Load services from Firebase with cache management
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
      const querySnapshot = await getDocs(q);

      const services: FirebaseService[] = [];
      querySnapshot.forEach((doc) => {
        const service = { id: doc.id, ...doc.data() } as FirebaseService;
        if (service.active !== false) { // Only active services
          services.push(service);
        }
      });

      this._services.set(services);
      this._lastSync.set(Date.now());
      this.saveServicesToCache(services);

      this.logger.info('Services loaded from Firebase', {
        component: 'FirebaseServicesService',
        method: 'loadServices'
      });

    } catch (error) {
      this.logger.firebaseError(error, 'loadServices', {
        component: 'FirebaseServicesService',
        method: 'loadServices'
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
  async createService(serviceData: Omit<FirebaseService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, showToast: boolean = true): Promise<FirebaseService | null> {
    try {
      // Check admin permissions
      if (!this.hasAdminAccess()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      const service = {
        ...serviceData,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'services'), service);

      // Create new service with ID
      const newService: FirebaseService = {
        ...service,
        id: docRef.id
      };

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
        userId: currentUser.uid
      });

      return newService;
    } catch (error) {
      this.logger.firebaseError(error, 'createService', {
        component: 'FirebaseServicesService',
        method: 'createService',
        userId: this.authService.user()?.uid
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
  async updateService(serviceId: string, updates: Partial<FirebaseService>, showToast: boolean = true, showLoader: boolean = true): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.hasAdminAccess()) {
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
        updatedAt: serverTimestamp()
      };

      // Update in Firestore
      const docRef = doc(this.firestore, 'services', serviceId);
      await updateDoc(docRef, updateData);

      // Update local state
      this._services.update(services =>
        services.map(service =>
          service.id === serviceId
            ? { ...service, ...updates }
            : service
        )
      );
      this._lastSync.set(Date.now());

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('serviceUpdated'));
      this.saveServicesToCache(this._services());

      if (showToast) {
        this.toastService.showSuccess('COMMON.SERVICE_UPDATED_SUCCESS');
      }
      this.logger.info('Service updated', {
        component: 'FirebaseServicesService',
        method: 'updateService',
        userId: currentUser.uid
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'updateService', {
        component: 'FirebaseServicesService',
        method: 'updateService',
        userId: this.authService.user()?.uid
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
      if (!this.hasAdminAccess()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Soft delete by setting active to false
      const docRef = doc(this.firestore, 'services', serviceId);
      await updateDoc(docRef, {
        active: false,
        updatedAt: serverTimestamp()
      });

      // Remove from local state
      this._services.update(services =>
        services.filter(service => service.id !== serviceId)
      );
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
        userId: currentUser.uid
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'deleteService', {
        component: 'FirebaseServicesService',
        method: 'deleteService',
        userId: this.authService.user()?.uid
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
   * Get service by ID
   */
  async getServiceById(serviceId: string): Promise<FirebaseService | null> {
    try {
      // First check local cache
      const localService = this.services().find(service => service.id === serviceId);
      if (localService) {
        return localService;
      }

      // If not in cache, fetch from Firebase
      const docRef = doc(this.firestore, 'services', serviceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const service = { id: docSnap.id, ...docSnap.data() } as FirebaseService;
        return service.active !== false ? service : null;
      }

      return null;
    } catch (error) {
      this.logger.firebaseError(error, 'getServiceById', {
        component: 'FirebaseServicesService',
        method: 'getServiceById'
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
    } catch (error) {
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
   * Create sample services for development (admin only)
   */
  async createSampleServices(): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.hasAdminAccess()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      const sampleServices: Omit<FirebaseService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
        {
          name: 'Tall Masculí',
          description: 'Corte clàssic o modern segons les teves preferències',
          price: 25,
          duration: 30,
          category: 'haircut',
          icon: '✂️',
          popular: true,
          active: true
        },
        {
          name: 'Tall + Afaitat',
          description: 'Corte complet amb afaitat de barba inclòs',
          price: 35,
          duration: 45,
          category: 'haircut',
          icon: '✂️',
          popular: true,
          active: true
        },
        {
          name: 'Afaitat de Barba',
          description: 'Afaitat tradicional amb navalla o màquina',
          price: 15,
          duration: 20,
          category: 'beard',
          icon: '🧔',
          active: true
        },
        {
          name: 'Arreglada de Barba',
          description: 'Perfilat i arreglada de barba',
          price: 12,
          duration: 15,
          category: 'beard',
          icon: '🧔',
          active: true
        },
        {
          name: 'Lavada i Tractament',
          description: 'Lavada professional amb productes de qualitat',
          price: 18,
          duration: 25,
          category: 'treatment',
          icon: '💆',
          active: true
        },
        {
          name: 'Coloració',
          description: 'Coloració completa o retocs',
          price: 45,
          duration: 60,
          category: 'treatment',
          icon: '💆',
          popular: true,
          active: true
        },
        {
          name: 'Pentinat Especial',
          description: 'Peinat per a esdeveniments especials',
          price: 30,
          duration: 40,
          category: 'styling',
          icon: '💇',
          popular: true,
          active: true
        },
        {
          name: 'Tall Infantil',
          description: 'Tall especial per a nens i nenes',
          price: 20,
          duration: 25,
          category: 'haircut',
          icon: '👶',
          active: true
        }
      ];

      let createdCount = 0;
      for (const serviceData of sampleServices) {
        try {
          const result = await this.createService(serviceData);
          if (result) {
            createdCount++;
          }
        } catch (error) {
          this.logger.error(`Error creating sample service: ${serviceData.name}`, {
            component: 'FirebaseServicesService',
            method: 'createSampleServices'
          });
        }
      }

      if (createdCount > 0) {
        this.toastService.showSuccess(`${createdCount} serveis d'exemple creats`);
        this.logger.info('Sample services created', {
          component: 'FirebaseServicesService',
          method: 'createSampleServices',
          data: { count: createdCount }
        });
      }

      return createdCount > 0;
    } catch (error) {
      this.logger.firebaseError(error, 'createSampleServices', {
        component: 'FirebaseServicesService',
        method: 'createSampleServices',
        userId: this.authService.user()?.uid
      });

      const errorMessage = error instanceof Error ? error.message : 'Error creating sample services';
      this._error.set(errorMessage);
      this.toastService.showGenericError('COMMON.ERROR_CREATING_SAMPLE_SERVICES');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Check if we should use cache instead of fetching from Firebase
   */
  private shouldUseCache(): boolean {
    const lastSync = this.lastSync();
    const now = Date.now();
    return lastSync > 0 && (now - lastSync) < this.CACHE_DURATION;
  }

  /**
   * Save services to local cache
   */
  private saveServicesToCache(services: FirebaseService[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(services));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      this.logger.warn('Failed to save services to cache', {
        component: 'FirebaseServicesService',
        method: 'saveServicesToCache'
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
        const services = JSON.parse(cachedServices) as FirebaseService[];
        const timestamp = parseInt(cacheTimestamp, 10);
        const now = Date.now();

        // Check if cache is still valid
        if ((now - timestamp) < this.CACHE_DURATION) {
          this._services.set(services);
          this._lastSync.set(timestamp);
          this.logger.info('Services loaded from cache', {
            component: 'FirebaseServicesService',
            method: 'loadServicesFromCache'
          });
        }
      }
    } catch (error) {
      this.logger.warn('Failed to load services from cache', {
        component: 'FirebaseServicesService',
        method: 'loadServicesFromCache'
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
    } catch (error) {
      this.logger.warn('Failed to clear cache', {
        component: 'FirebaseServicesService',
        method: 'clearCache'
      });
    }
  }

  // ===== CATEGORY MANAGEMENT =====

  /**
   * Load custom categories from Firebase
   */
  private async loadCustomCategories(): Promise<void> {
    try {
      const categoriesRef = collection(this.firestore, 'serviceCategories');
      const querySnapshot = await getDocs(categoriesRef);

      const customCategories: ServiceCategory[] = [];
      querySnapshot.forEach((doc) => {
        const category = { id: doc.id, ...doc.data() } as ServiceCategory;
        customCategories.push(category);
      });

      this._customCategories.set(customCategories);
    } catch (error) {
      this.logger.firebaseError(error, 'loadCustomCategories', {
        component: 'FirebaseServicesService',
        method: 'loadCustomCategories'
      });
      // Set empty array if there's an error
      this._customCategories.set([]);
    }
  }

  /**
   * Get all categories (static + custom from Firebase)
   */
  async getAllCategories(): Promise<ServiceCategory[]> {
    try {
      // Get custom categories from Firebase
      const categoriesRef = collection(this.firestore, 'serviceCategories');
      const querySnapshot = await getDocs(categoriesRef);

      const customCategories: ServiceCategory[] = [];
      querySnapshot.forEach((doc) => {
        const category = { id: doc.id, ...doc.data() } as ServiceCategory;
        customCategories.push(category);
      });

      // Combine static and custom categories
      return [...this._staticCategories, ...customCategories];
    } catch (error) {
      this.logger.firebaseError(error, 'getAllCategories', {
        component: 'FirebaseServicesService',
        method: 'getAllCategories'
      });
      // Return only static categories if there's an error
      return this._staticCategories;
    }
  }

  /**
   * Create a new custom category (admin only)
   */
  async createCategory(categoryData: { name: string; icon: string; id: string }, showToast: boolean = true): Promise<ServiceCategory | null> {
    try {
      // Check admin permissions
      if (!this.hasAdminAccess()) {
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
        createdBy: currentUser.uid
      };

      // Save to Firestore
      const docRef = await addDoc(collection(this.firestore, 'serviceCategories'), category);

      // Create new category with ID
      const newCategory: ServiceCategory = {
        ...category,
        id: docRef.id
      };

      // Update local categories
      this._customCategories.update(categories => [...categories, newCategory]);

      if (showToast) {
        this.toastService.showSuccess('COMMON.CATEGORY_CREATED_SUCCESS');
      }
      this.logger.info('Category created', {
        component: 'FirebaseServicesService',
        method: 'createCategory',
        userId: currentUser.uid
      });

      return newCategory;
    } catch (error) {
      this.logger.firebaseError(error, 'createCategory', {
        component: 'FirebaseServicesService',
        method: 'createCategory',
        userId: this.authService.user()?.uid
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
  async updateCategory(categoryId: string, updates: Partial<ServiceCategory>, showToast: boolean = true): Promise<boolean> {
    try {
      // Check admin permissions
      if (!this.hasAdminAccess()) {
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
        updatedAt: serverTimestamp()
      });

      // Update local categories
      this._customCategories.update(categories =>
        categories.map(category =>
          category.id === categoryId
            ? { ...category, ...updates }
            : category
        )
      );

      if (showToast) {
        this.toastService.showSuccess('COMMON.CATEGORY_UPDATED_SUCCESS');
      }
      this.logger.info('Category updated', {
        component: 'FirebaseServicesService',
        method: 'updateCategory',
        userId: currentUser.uid,
        data: { categoryId }
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'updateCategory', {
        component: 'FirebaseServicesService',
        method: 'updateCategory',
        userId: this.authService.user()?.uid,
        data: { categoryId }
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
      if (!this.hasAdminAccess()) {
        throw new Error('Access denied - admin required');
      }

      this._isLoading.set(true);
      this._error.set(null);

      const currentUser = this.authService.user();
      if (!currentUser?.uid) {
        throw new Error('Authentication required');
      }

      // Check if category is being used by any services
      const servicesUsingCategory = this.services().filter(service => service.category === categoryId);
      if (servicesUsingCategory.length > 0) {
        throw new Error(`Cannot delete category: ${servicesUsingCategory.length} services are using it`);
      }

      // Delete from Firestore
      await deleteDoc(doc(this.firestore, 'serviceCategories', categoryId));

      // Update local categories
      this._customCategories.update(categories =>
        categories.filter(cat => cat.id !== categoryId)
      );

      if (showToast) {
        this.toastService.showSuccess('COMMON.CATEGORY_DELETED_SUCCESS');
      }
      this.logger.info('Category deleted', {
        component: 'FirebaseServicesService',
        method: 'deleteCategory',
        userId: currentUser.uid,
        data: { categoryId }
      });

      return true;
    } catch (error) {
      this.logger.firebaseError(error, 'deleteCategory', {
        component: 'FirebaseServicesService',
        method: 'deleteCategory',
        userId: this.authService.user()?.uid,
        data: { categoryId }
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
