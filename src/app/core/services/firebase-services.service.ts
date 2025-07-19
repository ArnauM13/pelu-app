import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from '@angular/fire/firestore';
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
  category: 'haircut' | 'beard' | 'treatment' | 'styling';
  icon: string;
  popular?: boolean;
  active?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface ServiceCategory {
  id: 'haircut' | 'beard' | 'treatment' | 'styling';
  name: string;
  icon: string;
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
  readonly serviceCategories: ServiceCategory[] = [
    { id: 'haircut', name: 'SERVICES.CATEGORIES.HAIRCUT', icon: '✂️' },
    { id: 'beard', name: 'SERVICES.CATEGORIES.BEARD', icon: '🧔' },
    { id: 'treatment', name: 'SERVICES.CATEGORIES.TREATMENT', icon: '💆' },
    { id: 'styling', name: 'SERVICES.CATEGORIES.STYLING', icon: '💇' }
  ];

  // Computed signals for filtered services
  readonly activeServices = computed(() =>
    this.services().filter(service => service.active !== false)
  );

  readonly popularServices = computed(() =>
    this.activeServices().filter(service => service.popular)
  );

  readonly servicesByCategory = computed(() => {
    const services = this.activeServices();
    const categories = this.serviceCategories;

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
      this.toastService.showGenericError('COMMON.ERROR_LOADING_SERVICES');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Create a new service (admin only)
   */
  async createService(serviceData: Omit<FirebaseService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<FirebaseService | null> {
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

      this.toastService.showSuccess('COMMON.SERVICE_CREATED_SUCCESS');
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
      this.toastService.showGenericError('COMMON.ERROR_CREATING_SERVICE');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Update an existing service (admin only)
   */
  async updateService(serviceId: string, updates: Partial<FirebaseService>): Promise<boolean> {
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
      this.saveServicesToCache(this._services());

      this.toastService.showSuccess('COMMON.SERVICE_UPDATED_SUCCESS');
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
      this.toastService.showGenericError('COMMON.ERROR_UPDATING_SERVICE');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Delete a service (admin only) - soft delete by setting active to false
   */
  async deleteService(serviceId: string): Promise<boolean> {
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

      this.toastService.showSuccess('COMMON.SERVICE_DELETED_SUCCESS');
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
      this.toastService.showGenericError('COMMON.ERROR_DELETING_SERVICE');
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
    const categoryConfig = this.serviceCategories.find(cat => cat.id === category);
    return categoryConfig?.name || 'SERVICES.CATEGORIES.UNKNOWN';
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: FirebaseService['category']): string {
    const categoryConfig = this.serviceCategories.find(cat => cat.id === category);
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
}
