import { Component, signal, computed, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './ui/layout/header/header.component';
import { AuthService } from './core/auth/auth.service';
import { ScrollService } from './core/services/scroll.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { runOneTimeMigration, isMigrationCompleted, markMigrationCompleted } from './shared/services';
import { ToastService } from './shared/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TranslateModule, HeaderComponent, ToastComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Core signals
  readonly title = signal('pelu-app');

  constructor(
    private authService: AuthService,
    private scrollService: ScrollService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {
    // Run one-time migration when user is authenticated
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      const user = this.authService.user();

      if (isAuthenticated && user?.uid && !isMigrationCompleted()) {
        const migratedCount = runOneTimeMigration(user.uid);
        if (migratedCount > 0) {
          console.log(`Successfully migrated ${migratedCount} old appointments`);
          this.toastService.showSuccess(
            this.translateService.instant('COMMON.MIGRATION.COMPLETED'),
            this.translateService.instant('COMMON.MIGRATION.MESSAGE', { count: migratedCount })
          );
          markMigrationCompleted();
        }
      }
    });
  }

  // Computed signals - utilitzem AuthService
  readonly isLoading = computed(() => this.authService.isLoading());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly shouldShowHeader = computed(() => this.isAuthenticated() && !this.isLoading());
}
