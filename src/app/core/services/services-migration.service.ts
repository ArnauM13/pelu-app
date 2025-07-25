import { Injectable, inject, signal, computed } from '@angular/core';
import { FirebaseServicesService, FirebaseService } from './firebase-services.service';
import { ServicesService } from './services.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class ServicesMigrationService {
  private readonly firebaseServicesService = inject(FirebaseServicesService);
  private readonly servicesService = inject(ServicesService);
  private readonly toastService = inject(ToastService);
  private readonly logger = inject(LoggerService);

  // Migration state signals
  private readonly _isMigrating = signal<boolean>(false);
  private readonly _migrationProgress = signal<number>(0);
  private readonly _migrationStatus = signal<string>('');

  // Public computed signals
  readonly isMigrating = computed(() => this._isMigrating());
  readonly migrationProgress = computed(() => this._migrationProgress());
  readonly migrationStatus = computed(() => this._migrationStatus());

  /**
   * Migrate current services to Firebase
   */
  async migrateServicesToFirebase(): Promise<boolean> {
    try {
      this.logger.info('Starting services migration to Firebase', {
        component: 'ServicesMigrationService',
        method: 'migrateServicesToFirebase',
      });

      this._isMigrating.set(true);
      this._migrationProgress.set(0);
      this._migrationStatus.set('Iniciant migració...');

      // Get current services from the old service
      const currentServices = this.servicesService.getAllServices();

      if (currentServices.length === 0) {
        this.logger.warn('No services to migrate', {
          component: 'ServicesMigrationService',
          method: 'migrateServicesToFirebase',
        });
        this._migrationStatus.set('No hi ha serveis per migrar');
        return false;
      }

      let migratedCount = 0;
      let errorCount = 0;

      // Migrate each service
      for (let i = 0; i < currentServices.length; i++) {
        const service = currentServices[i];
        const progress = Math.round(((i + 1) / currentServices.length) * 100);

        this._migrationProgress.set(progress);
        this._migrationStatus.set(
          `Migrant servei ${i + 1} de ${currentServices.length}: ${service.name}`
        );

        try {
          const firebaseService: Omit<
            FirebaseService,
            'id' | 'createdAt' | 'updatedAt' | 'createdBy'
          > = {
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            category: service.category,
            icon: service.icon,
            popular: service.popular || false,
            active: true,
          };

          const result = await this.firebaseServicesService.createService(firebaseService);
          if (result) {
            migratedCount++;
            this.logger.info(`Service migrated: ${service.name}`, {
              component: 'ServicesMigrationService',
              method: 'migrateServicesToFirebase',
            });
          } else {
            errorCount++;
            this.logger.error(`Failed to migrate service: ${service.name}`, {
              component: 'ServicesMigrationService',
              method: 'migrateServicesToFirebase',
            });
          }
        } catch (error) {
          errorCount++;
          this.logger.error(`Error migrating service: ${service.name}`, {
            component: 'ServicesMigrationService',
            method: 'migrateServicesToFirebase',
          });
        }
      }

      // Show migration results
      if (migratedCount > 0) {
        this.toastService.showSuccess(`Migració completada: ${migratedCount} serveis migrats`);
        this._migrationStatus.set(`Migració completada: ${migratedCount} serveis migrats`);
        this.logger.info('Services migration completed', {
          component: 'ServicesMigrationService',
          method: 'migrateServicesToFirebase',
        });
      }

      if (errorCount > 0) {
        this.toastService.showWarning(`${errorCount} serveis no s'han pogut migrar`);
        this._migrationStatus.set(`Migració completada amb ${errorCount} errors`);
      }

      return migratedCount > 0;
    } catch (error) {
      this.logger.error('Services migration failed', {
        component: 'ServicesMigrationService',
        method: 'migrateServicesToFirebase',
      });

      this.toastService.showGenericError('Error en la migració de serveis');
      this._migrationStatus.set('Error en la migració');
      return false;
    } finally {
      this._isMigrating.set(false);
    }
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    try {
      // Load services from Firebase
      await this.firebaseServicesService.loadServices();
      const firebaseServices = this.firebaseServicesService.services();

      // If Firebase has services, migration is not needed
      if (firebaseServices.length > 0) {
        return false;
      }

      // Check if we have local services to migrate
      const localServices = this.servicesService.getAllServices();
      return localServices.length > 0;
    } catch (error) {
      this.logger.error('Error checking migration status', {
        component: 'ServicesMigrationService',
        method: 'isMigrationNeeded',
      });
      return false;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    needsMigration: boolean;
    localServicesCount: number;
    firebaseServicesCount: number;
  }> {
    try {
      const localServices = this.servicesService.getAllServices();
      await this.firebaseServicesService.loadServices();
      const firebaseServices = this.firebaseServicesService.services();

      return {
        needsMigration: localServices.length > 0 && firebaseServices.length === 0,
        localServicesCount: localServices.length,
        firebaseServicesCount: firebaseServices.length,
      };
    } catch (error) {
      this.logger.error('Error getting migration status', {
        component: 'ServicesMigrationService',
        method: 'getMigrationStatus',
      });

      return {
        needsMigration: false,
        localServicesCount: 0,
        firebaseServicesCount: 0,
      };
    }
  }
}
