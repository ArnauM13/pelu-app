import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from '../input-text/input-text.component';
import { InputTextareaComponent } from '../input-textarea/input-textarea.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { InputEmailComponent } from '../input-email/input-email.component';
import { InputPasswordComponent } from '../input-password/input-password.component';
import { InputDateComponent } from '../input-date/input-date.component';
import { InputCheckboxComponent } from '../input-checkbox/input-checkbox.component';
import { InputSelectComponent } from '../input-select/input-select.component';

@Component({
    selector: 'pelu-inputs-demo',
    imports: [
        CommonModule,
        TranslateModule,
        InputTextComponent,
        InputTextareaComponent,
        InputNumberComponent,
        InputEmailComponent,
        InputPasswordComponent,
        InputDateComponent,
        InputCheckboxComponent,
        InputSelectComponent
    ],
    templateUrl: './inputs-demo.component.html',
    styleUrls: ['./inputs-demo.component.scss']
})
export class InputsDemoComponent {
  // Form data signals
  readonly formData = signal({
    name: '',
    email: '',
    password: '',
    description: '',
    age: 25,
    birthDate: '',
    terms: false,
    category: '',
    notes: ''
  });

  // Select options
  readonly categoryOptions = [
    { label: 'Opció 1', value: 'option1', color: '#3b82f6' },
    { label: 'Opció 2', value: 'option2', color: '#10b981' },
    { label: 'Opció 3', value: 'option3', color: '#f59e0b' }
  ];

  // Update methods
  updateField(field: keyof ReturnType<typeof this.formData>, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
