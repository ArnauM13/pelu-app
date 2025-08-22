import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { SystemParametersService } from '../../../core/services/system-parameters.service';

import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/components/inputs/input-number/input-number.component';
import { InputCheckboxComponent } from '../../../shared/components/inputs/input-checkbox/input-checkbox.component';
import { InputSelectComponent } from '../../../shared/components/inputs/input-select/input-select.component';
import { InputMultiSelectComponent, MultiSelectOption } from '../../../shared/components/inputs/input-multiselect/input-multiselect.component';
import { InputDateComponent } from '../../../shared/components/inputs/input-date/input-date.component';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'pelu-admin-settings-page',
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
    InputMultiSelectComponent,
    InputDateComponent,
    ButtonComponent,
    LoadingStateComponent,
  ],
  templateUrl: './admin-settings-page.component.html',
  styleUrls: ['./admin-settings-page.component.scss'],
})
export class AdminSettingsPageComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);

  private fb = inject(FormBuilder);
  private currencyService = inject(CurrencyService);
  private systemParametersService = inject(SystemParametersService);

  settingsForm!: FormGroup;

  // Mode management
  private readonly isEditModeSignal = signal(false);
  private originalFormValues: Record<string, unknown> | null = null;

  // Use the system parameters service
  parameters = computed(() => this.systemParametersService.parameters());
  loading = computed(() => this.systemParametersService.loading());
  error = computed(() => this.systemParametersService.error());

  saving = signal(false);

  // Computed properties
  readonly isEditMode = computed(() => this.isEditModeSignal());

  // Working days options with translated labels
  workingDaysOptions: MultiSelectOption[] = [];

  constructor() {
    this.generateWorkingDaysOptions();
  }

  private generateWorkingDaysOptions(): void {
    this.workingDaysOptions = [
      { label: this.translateService.instant('DAYS.MONDAY'), value: 1 },
      { label: this.translateService.instant('DAYS.TUESDAY'), value: 2 },
      { label: this.translateService.instant('DAYS.WEDNESDAY'), value: 3 },
      { label: this.translateService.instant('DAYS.THURSDAY'), value: 4 },
      { label: this.translateService.instant('DAYS.FRIDAY'), value: 5 },
      { label: this.translateService.instant('DAYS.SATURDAY'), value: 6 },
      { label: this.translateService.instant('DAYS.SUNDAY'), value: 0 },
    ];
  }

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

  currencyOptions = [
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'USD ($)', value: 'USD' },
    { label: 'GBP (£)', value: 'GBP' },
  ];

  ngOnInit() {
    // Regenerate options when component initializes to ensure translations are loaded
    this.generateWorkingDaysOptions();
    this.initializeForm();
    this.loadSettings();
  }

  private initializeForm() {
    const currentParameters = this.parameters();
    const businessHours = this.systemParametersService.getBusinessHours();
    const lunchBreak = this.systemParametersService.getLunchBreak();

    // Convert numeric hours to Date objects for time inputs
    const createTimeDate = (hour: number): Date => {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      return date;
    };

    this.settingsForm = this.fb.group({
      businessName: [currentParameters.businessInfo.name],
      businessAddress: [currentParameters.businessInfo.address],
      businessPhone: [currentParameters.businessInfo.phone],
      businessHoursStart: [createTimeDate(businessHours.start)],
      businessHoursEnd: [createTimeDate(businessHours.end)],
      lunchBreakStart: [createTimeDate(lunchBreak.start)],
      lunchBreakEnd: [createTimeDate(lunchBreak.end)],
      workingDays: [currentParameters.workingDays || []],
      appointmentDuration: [currentParameters.appointmentDuration],
      maxAppointmentsPerUser: [currentParameters.maxAppointmentsPerUser],
      autoConfirm: [currentParameters.autoConfirmAppointments],
      sendNotifications: [currentParameters.sendNotifications],
      defaultLanguage: [currentParameters.language],
      currency: [currentParameters.currency],
      // New booking parameters
      preventCancellation: [currentParameters.preventCancellation],
      cancellationTimeLimit: [currentParameters.cancellationTimeLimit],
      bookingAdvanceDays: [currentParameters.bookingAdvanceDays],
      bookingAdvanceTime: [currentParameters.bookingAdvanceTime],
    });
  }

  async loadSettings() {
    try {
      await this.systemParametersService.loadParameters();
      // Reinitialize form with new settings
      this.initializeForm();
      this.originalFormValues = null;
    } catch (error) {
      console.error('Error loading settings:', error);
      this.toastService.showError('Error', 'Error al carregar la configuració');
    }
  }

  private updateFormWithCurrentSettings() {
    if (this.settingsForm) {
      const currentParameters = this.parameters();
      const businessHours = this.systemParametersService.getBusinessHours();
      const lunchBreak = this.systemParametersService.getLunchBreak();

      // Convert numeric hours to Date objects for time inputs
      const createTimeDate = (hour: number): Date => {
        const date = new Date();
        date.setHours(hour, 0, 0, 0);
        return date;
      };

      this.settingsForm.patchValue({
        businessName: currentParameters.businessInfo.name,
        businessAddress: currentParameters.businessInfo.address,
        businessPhone: currentParameters.businessInfo.phone,
        businessHoursStart: createTimeDate(businessHours.start),
        businessHoursEnd: createTimeDate(businessHours.end),
        lunchBreakStart: createTimeDate(lunchBreak.start),
        lunchBreakEnd: createTimeDate(lunchBreak.end),
        workingDays: currentParameters.workingDays,
        appointmentDuration: currentParameters.appointmentDuration,
        maxAppointmentsPerUser: currentParameters.maxAppointmentsPerUser,
        autoConfirm: currentParameters.autoConfirmAppointments,
        sendNotifications: currentParameters.sendNotifications,
        defaultLanguage: currentParameters.language,
        currency: currentParameters.currency,
        preventCancellation: currentParameters.preventCancellation,
        cancellationTimeLimit: currentParameters.cancellationTimeLimit,
        bookingAdvanceDays: currentParameters.bookingAdvanceDays,
        bookingAdvanceTime: currentParameters.bookingAdvanceTime,
      });
    }
  }

  setEditMode() {
    this.isEditModeSignal.set(true);
    this.originalFormValues = this.settingsForm.value;
  }

  cancelEditMode() {
    this.isEditModeSignal.set(false);
    if (this.originalFormValues) {
      this.settingsForm.patchValue(this.originalFormValues);
    }
  }

  setViewMode() {
    this.isEditModeSignal.set(false);
    this.originalFormValues = null;
  }

  // Helper method to get day label by value
  getDayLabelByValue(value: string | number): string {
    const option = this.workingDaysOptions.find(opt => opt.value === value);
    return option ? option.label : '';
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

        // Validate and format time values before saving
        const formatTimeValue = (value: unknown): number => {
          if (!value) return 0;

          // If it's already a number, return as is
          if (typeof value === 'number') {
            return value >= 0 && value <= 23 ? value : 0;
          }

          // If it's a Date object (from timeOnly input), extract the hour
          if (value instanceof Date) {
            return value.getHours();
          }

          // If it's a string, try to parse it
          if (typeof value === 'string') {
            // Handle time format like "13:00" or "13"
            const parts = value.split(':');
            const hour = parseInt(parts[0]);
            if (!isNaN(hour) && hour >= 0 && hour <= 23) {
              return hour;
            }
          }

          return 0;
        };

        // Save business hours and lunch break
        await this.systemParametersService.updateBusinessHours({
          start: formatTimeValue(formValue.businessHoursStart),
          end: formatTimeValue(formValue.businessHoursEnd),
          lunchStart: formatTimeValue(formValue.lunchBreakStart),
          lunchEnd: formatTimeValue(formValue.lunchBreakEnd),
        });

        // Save other settings using the system parameters service
        await this.systemParametersService.saveParameters({
          businessInfo: {
            name: formValue.businessName,
            address: formValue.businessAddress,
            phone: formValue.businessPhone,
          },
          workingDays: formValue.workingDays,
          appointmentDuration: formValue.appointmentDuration,
          maxAppointmentsPerUser: formValue.maxAppointmentsPerUser,
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

        // Clear original form values since changes are now permanent
        this.originalFormValues = null;

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


}
