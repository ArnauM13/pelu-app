import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from './input-text.component';

@Component({
  selector: 'pelu-input-text-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InputTextComponent],
  template: `
    <div class="demo-container">
      <h2>Input Text Components Demo</h2>

      <div class="demo-section">
        <h3>Text Input</h3>
        <pelu-input-text
          label="Nom complet"
          placeholder="Introdueix el teu nom complet"
          [(value)]="textValue"
          [required]="true"
          size="small"
          variant="outlined"
        />
        <p class="demo-value">Valor: {{ textValue }}</p>
      </div>

      <div class="demo-section">
        <h3>Email Input</h3>
        <pelu-input-text
          label="Correu electrònic"
          placeholder="exemple@email.com"
          type="email"
          [(value)]="emailValue"
          [required]="true"
          size="small"
          variant="outlined"
        />
        <p class="demo-value">Valor: {{ emailValue }}</p>
      </div>

      <div class="demo-section">
        <h3>Password Input</h3>
        <pelu-input-text
          label="Contrasenya"
          placeholder="Introdueix la teva contrasenya"
          type="password"
          [(value)]="passwordValue"
          [required]="true"
          size="small"
          variant="outlined"
        />
        <p class="demo-value">Valor: {{ passwordValue ? '***' : '' }}</p>
      </div>

      <div class="demo-section">
        <h3>Filled Variant</h3>
        <pelu-input-text
          label="Text amb variant filled"
          placeholder="Aquest input té variant filled"
          [(value)]="filledValue"
          variant="filled"
          size="large"
        />
        <p class="demo-value">Valor: {{ filledValue }}</p>
      </div>

      <div class="demo-section">
        <h3>Disabled Input</h3>
        <pelu-input-text
          label="Input deshabilitat"
          placeholder="Aquest input està deshabilitat"
          [(value)]="disabledValue"
          [disabled]="true"
          size="small"
          variant="outlined"
        />
      </div>

      <div class="demo-section">
        <h3>Invalid Input</h3>
        <pelu-input-text
          label="Input invàlid"
          placeholder="Aquest input té estat invàlid"
          [(value)]="invalidValue"
          [invalid]="true"
          size="small"
          variant="outlined"
        />
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #f9fafb;
    }

    .demo-section h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #374151;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .demo-value {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
      font-family: monospace;
      background-color: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  `]
})
export class InputTextDemoComponent {
  textValue = '';
  emailValue = '';
  passwordValue = '';
  filledValue = '';
  disabledValue = 'Valor fixe';
  invalidValue = '';
}
