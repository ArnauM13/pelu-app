import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { BusinessSettingsService } from '../../../core/services/business-settings.service';

import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/components/inputs/input-number/input-number.component';
import { InputCheckboxComponent } from '../../../shared/components/inputs/input-checkbox/input-checkbox.component';
import { InputSelectComponent } from '../../../shared/components/inputs/input-select/input-select.component';
import { InputDateComponent } from '../../../shared/components/inputs/input-date/input-date.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';

@Component({
  selector: 'app-admin-settings-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    ProgressSpinnerModule,
    InputTextComponent,
    InputNumberComponent,
    InputCheckboxComponent,
    InputSelectComponent,
    InputDateComponent,
    ButtonComponent,
  ],
  templateUrl: './admin-settings-page.component.html',
  styleUrls: ['./admin-settings-page.component.scss'],
})
export class AdminSettingsPageComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

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
    { label: 'Diumenge', value: 0 },
  ];

  backupFrequencyOptions = [
    { label: 'Diari', value: 'daily' },
    { label: 'Setmanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
  ];

  languageOptions = [
    { label: 'Català', value: 'ca' },
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' },
  ];

  timezoneOptions = [
    { label: 'Madrid (UTC+1)', value: 'Europe/Madrid' },
    { label: 'Barcelona (UTC+1)', value: 'Europe/Madrid' },
    { label: 'Londres (UTC+0)', value: 'Europe/London' },
    { label: 'Nova York (UTC-5)', value: 'America/New_York' },
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

  toggleEditMode() {
    if (this.isEditMode()) {
      this.setViewMode();
    } else {
      this.setEditMode();
    }
  }

  // Time handling methods
  getTimeValue(timeString: string | null): Date | null {
    if (!timeString) return null;

    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  onTimeChange(date: Date | string | null, fieldName: string) {
    if (!date || !(date instanceof Date)) {
      this.settingsForm.get(fieldName)?.setValue('');
      return;
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    this.settingsForm.get(fieldName)?.setValue(timeString);
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
    const businessHoursString = this.businessSettingsService.getBusinessHoursString();
    const lunchBreak = this.businessSettingsService.getLunchBreak();

    this.settingsForm = this.fb.group({
      businessName: [currentSettings.businessName],
      businessHoursStart: [businessHoursString.start],
      businessHoursEnd: [businessHoursString.end],
      lunchBreakStart: [lunchBreak.start],
      lunchBreakEnd: [lunchBreak.end],
      appointmentDuration: [currentSettings.appointmentDuration],
      maxAppointments: [currentSettings.maxAppointmentsPerDay],
      autoConfirm: [currentSettings.autoConfirmAppointments],
      sendNotifications: [currentSettings.sendNotifications],
      defaultLanguage: [currentSettings.language],
      currency: [currentSettings.currency],
      // New booking parameters
      preventCancellation: [currentSettings.preventCancellation],
      cancellationTimeLimit: [currentSettings.cancellationTimeLimit],
      bookingAdvanceDays: [currentSettings.bookingAdvanceDays],
      bookingAdvanceTime: [currentSettings.bookingAdvanceTime],
    });
  }

  async loadSettings() {
    try {
      await this.businessSettingsService.loadSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.toastService.showError('Error', 'Error al carregar la configuració');
    }
  }

  async saveSettings() {
    if (this.settingsForm.valid) {
      this.saving.set(true);
      try {
        const formValue = this.settingsForm.value;

        // Update currency if changed
        if (
          formValue.currency &&
          formValue.currency !== this.currencyService.getCurrentCurrency()
        ) {
          this.currencyService.setCurrentCurrency(formValue.currency);
        }

        // Save business hours and lunch break
        await this.businessSettingsService.updateBusinessHoursString({
          start: formValue.businessHoursStart,
          end: formValue.businessHoursEnd,
          lunchStart: formValue.lunchBreakStart,
          lunchEnd: formValue.lunchBreakEnd,
        });

        // Save other settings using the business settings service
        await this.businessSettingsService.saveSettings({
          businessName: formValue.businessName,
          appointmentDuration: formValue.appointmentDuration,
          maxAppointmentsPerDay: formValue.maxAppointments,
          autoConfirmAppointments: formValue.autoConfirm,
          sendNotifications: formValue.sendNotifications,
          language: formValue.defaultLanguage,
          currency: formValue.currency,
          // New booking parameters
          preventCancellation: formValue.preventCancellation,
          cancellationTimeLimit: formValue.cancellationTimeLimit,
          bookingAdvanceDays: formValue.bookingAdvanceDays,
          bookingAdvanceTime: formValue.bookingAdvanceTime,
        });

        this.toastService.showSuccess('Èxit', 'Configuració desada correctament');

        // Switch back to view mode after saving
        this.setViewMode();
      } catch (error) {
        console.error('Error saving settings:', error);
        this.toastService.showError('Error', 'Error al desar la configuració');
      } finally {
        this.saving.set(false);
      }
    }
  }

  resetToDefaults() {
    if (confirm('Estàs segur que vols restaurar la configuració per defecte?')) {
      this.businessSettingsService
        .resetToDefaults()
        .then(() => {
          this.toastService.showInfo('Restaurat', 'Configuració restaurada per defecte');
        })
        .catch(error => {
          console.error('Error resetting to defaults:', error);
          this.toastService.showError('Error', 'Error al restaurar la configuració per defecte');
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
        defaultLanguage: 'ca',
        preventCancellation: false,
        cancellationTimeLimit: 24,
        bookingAdvanceDays: 30,
        bookingAdvanceTime: 30,
      });
    }
  }

  getWorkingDaysLabels(): string {
    const workingDays = this.settings().workingDays;
    return workingDays
      .map(day => {
        const option = this.workingDaysOptions.find(opt => opt.value === day);
        return option ? option.label : day.toString();
      })
      .join(', ');
  }

  formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  getBusinessHoursDisplay(): string {
    const businessHours = this.businessSettingsService.getBusinessHoursString();
    return `${businessHours.start} - ${businessHours.end}`;
  }

  getLunchBreakDisplay(): string {
    const lunchBreak = this.businessSettingsService.getLunchBreak();
    return `${lunchBreak.start} - ${lunchBreak.end}`;
  }
}
