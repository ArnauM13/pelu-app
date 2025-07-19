import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { BusinessSettingsService, BusinessSettings } from '../../../core/services/business-settings.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';



@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    CardComponent,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './admin-settings-page.component.html',
  styleUrls: ['./admin-settings-page.component.scss']
})
export class AdminSettingsPageComponent {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private currencyService = inject(CurrencyService);
  private businessSettingsService = inject(BusinessSettingsService);

  settingsForm!: FormGroup;

  // Mode management
  private readonly isEditModeSignal = signal(false);

  // Use the business settings service
  settings = computed(() => this.businessSettingsService.settings());
  loading = computed(() => this.businessSettingsService.loading());
  error = computed(() => this.businessSettingsService.error());

  saving = signal(false);

  // Computed properties
  readonly isEditMode = computed(() => this.isEditModeSignal());

  workingDaysOptions = [
    { label: 'Dilluns', value: 1 },
    { label: 'Dimarts', value: 2 },
    { label: 'Dimecres', value: 3 },
    { label: 'Dijous', value: 4 },
    { label: 'Divendres', value: 5 },
    { label: 'Dissabte', value: 6 },
    { label: 'Diumenge', value: 0 }
  ];

  backupFrequencyOptions = [
    { label: 'Diari', value: 'daily' },
    { label: 'Setmanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' }
  ];

  languageOptions = [
    { label: 'Català', value: 'ca' },
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' }
  ];

  timezoneOptions = [
    { label: 'Madrid (UTC+1)', value: 'Europe/Madrid' },
    { label: 'Barcelona (UTC+1)', value: 'Europe/Madrid' },
    { label: 'Londres (UTC+0)', value: 'Europe/London' },
    { label: 'Nova York (UTC-5)', value: 'America/New_York' }
  ];

  get currencyOptions() {
    return this.currencyService.getCurrencyOptions();
  }

  ngOnInit() {
    this.initializeForm();
    this.loadSettings();
  }

  // Mode management methods
  setViewMode() {
    this.isEditModeSignal.set(false);
  }

  setEditMode() {
    this.isEditModeSignal.set(true);
  }

  // Helper methods for display
  getLanguageLabel(value: string): string {
    const option = this.languageOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getCurrencyLabel(value: string): string {
    const option = this.currencyOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  private initializeForm() {
    const currentSettings = this.settings();
    this.settingsForm = this.fb.group({
      businessName: [currentSettings.businessName],
      appointmentDuration: [currentSettings.appointmentDuration],
      maxAppointments: [currentSettings.maxAppointmentsPerDay],
      autoConfirm: [currentSettings.autoConfirmAppointments],
      sendNotifications: [currentSettings.sendNotifications],
      maintenanceMode: [currentSettings.maintenanceMode],
      defaultLanguage: [currentSettings.language],
      currency: [currentSettings.currency]
    });
  }

  async loadSettings() {
    try {
      await this.businessSettingsService.loadSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al carregar la configuració'
      });
    }
  }

  async saveSettings() {
    if (this.settingsForm.valid) {
      this.saving.set(true);
      try {
        const formValue = this.settingsForm.value;

        // Update currency if changed
        if (formValue.currency && formValue.currency !== this.currencyService.getCurrentCurrency()) {
          this.currencyService.setCurrentCurrency(formValue.currency);
        }

        // Save settings using the business settings service
        await this.businessSettingsService.saveSettings({
          businessName: formValue.businessName,
          appointmentDuration: formValue.appointmentDuration,
          maxAppointmentsPerDay: formValue.maxAppointments,
          autoConfirmAppointments: formValue.autoConfirm,
          sendNotifications: formValue.sendNotifications,
          maintenanceMode: formValue.maintenanceMode,
          language: formValue.defaultLanguage,
          currency: formValue.currency
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Èxit',
          detail: 'Configuració desada correctament'
        });

        // Switch back to view mode after saving
        this.setViewMode();
      } catch (error) {
        console.error('Error saving settings:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al desar la configuració'
        });
      } finally {
        this.saving.set(false);
      }
    }
  }

  resetToDefaults() {
    if (confirm('Estàs segur que vols restaurar la configuració per defecte?')) {
      this.businessSettingsService.resetToDefaults().then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Restaurat',
          detail: 'Configuració restaurada per defecte'
        });
      }).catch(error => {
        console.error('Error resetting to defaults:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al restaurar la configuració per defecte'
        });
      });
    }
  }

  resetSettings() {
    if (confirm('Estàs segur que vols restaurar la configuració per defecte?')) {
      this.settingsForm.patchValue({
        businessName: 'PeluApp',
        appointmentDuration: 60,
        maxAppointments: 20,
        autoConfirm: false,
        sendNotifications: true,
        maintenanceMode: false,
        defaultLanguage: 'ca'
      });
    }
  }

  toggleMaintenanceMode() {
    const currentSettings = this.settings();
    this.businessSettingsService.saveSettings({
      maintenanceMode: !currentSettings.maintenanceMode
    });
  }

  getWorkingDaysLabels(): string {
    const workingDays = this.settings().workingDays;
    return workingDays.map(day => {
      const option = this.workingDaysOptions.find(opt => opt.value === day);
      return option ? option.label : day.toString();
    }).join(', ');
  }

  formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
}
