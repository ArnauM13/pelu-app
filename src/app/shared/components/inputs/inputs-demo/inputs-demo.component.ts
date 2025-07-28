import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from '../input-text/input-text.component';
import { InputTextareaComponent } from '../input-textarea/input-textarea.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { InputDateComponent } from '../input-date/input-date.component';
import { InputCheckboxComponent } from '../input-checkbox/input-checkbox.component';
import { InputSelectComponent } from '../input-select/input-select.component';
import { InputPasswordComponent } from '../input-password/input-password.component';
import { InputToggleSwitchComponent } from '../input-toggleswitch/input-toggleswitch.component';

@Component({
  selector: 'pelu-inputs-demo',
  imports: [
    CommonModule,
    TranslateModule,
    InputTextComponent,
    InputTextareaComponent,
    InputNumberComponent,
    InputDateComponent,
    InputCheckboxComponent,
    InputSelectComponent,
    InputPasswordComponent,
    InputToggleSwitchComponent,
  ],
  templateUrl: './inputs-demo.component.html',
  styleUrls: ['./inputs-demo.component.scss'],
})
export class InputsDemoComponent {
  // Form data signals
  readonly formData = signal({
    name: '',
    email: '',
    password: '',
    description: '',
    age: null,
    birthDate: null as Date | string | null,
    appointmentDate: null as Date | string | null,
    appointmentTime: null as Date | string | null,
    demoDate: new Date() as Date | string | null, // Pre-selected date for demo
    inlineDate: new Date() as Date | string | null, // Date for inline calendar demo
    terms: false,
    category: '',
    service: '',
    notes: '',
    favorite: false,
  });

  // Select options
  readonly categoryOptions = [
    { label: 'Opció 1', value: 'option1', color: '#3b82f6' },
    { label: 'Opció 2', value: 'option2', color: '#10b981' },
    { label: 'Opció 3', value: 'option3', color: '#f59e0b' },
  ];

  // Service options with rich data for templates
  readonly serviceOptions = [
    {
      label: 'Tall de Cabell',
      value: 'haircut',
      color: '#3b82f6',
      price: 25,
      duration: 30,
      description: 'Tall de cabell professional',
      category: 'Cabell',
      icon: 'pi pi-user',
      popular: true,
      new: false,
      discount: 0,
      available: true
    },
    {
      label: 'Coloració',
      value: 'coloring',
      color: '#ef4444',
      price: 45,
      duration: 60,
      description: 'Coloració completa del cabell',
      category: 'Coloració',
      icon: 'pi pi-palette',
      popular: true,
      new: false,
      discount: 10,
      available: true
    },
    {
      label: 'Estil',
      value: 'styling',
      color: '#10b981',
      price: 35,
      duration: 45,
      description: 'Estil i arreglat del cabell',
      category: 'Estil',
      icon: 'pi pi-brush',
      popular: false,
      new: false,
      discount: 0,
      available: true
    },
    {
      label: 'Tractament',
      value: 'treatment',
      color: '#f59e0b',
      price: 55,
      duration: 90,
      description: 'Tractament regenerador',
      category: 'Tractament',
      icon: 'pi pi-heart',
      popular: false,
      new: true,
      discount: 0,
      available: true
    },
    {
      label: 'Arreglat de Barba',
      value: 'beard',
      color: '#8b5cf6',
      price: 20,
      duration: 25,
      description: 'Modelat i arreglat de barba',
      category: 'Barba',
      icon: 'pi pi-user',
      popular: false,
      new: false,
      discount: 0,
      available: true
    },
    {
      label: 'Estilitzat de Boda',
      value: 'wedding',
      color: '#f97316',
      price: 80,
      duration: 120,
      description: 'Estilització especial per a esdeveniments',
      category: 'Especial',
      icon: 'pi pi-star',
      popular: true,
      new: false,
      discount: 15,
      available: false
    }
  ];

  // Computed properties for service statistics
  readonly popularServicesCount = computed(() =>
    this.serviceOptions.filter(service => service.popular).length
  );

  readonly averageDuration = computed(() => {
    const total = this.serviceOptions.reduce((sum, service) => sum + service.duration, 0);
    return Math.round(total / this.serviceOptions.length);
  });

  readonly averagePrice = computed(() => {
    const total = this.serviceOptions.reduce((sum, service) => sum + service.price, 0);
    return Math.round(total / this.serviceOptions.length);
  });

  // Update methods
  updateField(field: keyof ReturnType<typeof this.formData>, value: unknown): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
