import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface SystemSettings {
  businessName: string;
  businessHours: {
    start: number;
    end: number;
    lunchStart: number;
    lunchEnd: number;
  };
  workingDays: number[];
  appointmentDuration: number;
  maxAppointmentsPerDay: number;
  autoConfirmAppointments: boolean;
  sendNotifications: boolean;
  maintenanceMode: boolean;
  backupFrequency: string;
  language: string;
  timezone: string;
  currency: string;
}

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './admin-settings-page.component.html',
  styleUrls: ['./admin-settings-page.component.scss']
})
export class AdminSettingsPageComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private currencyService = inject(CurrencyService);

  settingsForm!: FormGroup;

  // Mode management
  private readonly isEditModeSignal = signal(false);

  settings = signal<SystemSettings>({
    businessName: 'Barberia Soca',
    businessHours: {
      start: 8,
      end: 20,
      lunchStart: 13,
      lunchEnd: 14
    },
    workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    appointmentDuration: 60,
    maxAppointmentsPerDay: 20,
    autoConfirmAppointments: false,
    sendNotifications: true,
    maintenanceMode: false,
    backupFrequency: 'daily',
    language: 'ca',
    timezone: 'Europe/Madrid',
    currency: 'EUR'
  });

  loading = signal(false);
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
    this.settingsForm = this.fb.group({
      businessName: [''],
      appointmentDuration: [60],
      maxAppointments: [20],
      autoConfirm: [false],
      sendNotifications: [true],
      maintenanceMode: [false],
      defaultLanguage: ['ca'],
      currency: [this.currencyService.getCurrentCurrency()]
    });
  }

  async loadSettings() {
    this.loading.set(true);
    try {
      // Simular càrrega de configuració (en un cas real, això vindria de Firestore)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Aquí carregaríem la configuració real de Firestore
      // const settings = await this.getSystemSettings();
      // this.settings.set(settings);

    } catch (error) {
      console.error('Error loading settings:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al carregar la configuració'
      });
    } finally {
      this.loading.set(false);
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

        // Simular desament (en un cas real, això es desaria a Firestore)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Aquí desaríem la configuració real a Firestore
        // await this.updateSystemSettings(this.settingsForm.value);

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
      this.settings.set({
        businessName: 'Barberia Soca',
        businessHours: {
          start: 8,
          end: 20,
          lunchStart: 13,
          lunchEnd: 14
        },
        workingDays: [1, 2, 3, 4, 5, 6],
        appointmentDuration: 60,
        maxAppointmentsPerDay: 20,
        autoConfirmAppointments: false,
        sendNotifications: true,
        maintenanceMode: false,
        backupFrequency: 'daily',
        language: 'ca',
        timezone: 'Europe/Madrid',
        currency: 'EUR'
      });

      this.messageService.add({
        severity: 'info',
        summary: 'Restaurat',
        detail: 'Configuració restaurada per defecte'
      });
    }
  }

  resetSettings() {
    if (confirm('Estàs segur que vols restaurar la configuració per defecte?')) {
      this.settingsForm.patchValue({
        businessName: 'Barberia Soca',
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
    const newSettings = {
      ...currentSettings,
      maintenanceMode: !currentSettings.maintenanceMode
    };
    this.settings.set(newSettings);
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
