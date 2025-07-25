import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'pelu-buttons-demo',
  imports: [CommonModule, TranslateModule, ButtonModule],
  templateUrl: './buttons-demo.component.html',
  styleUrls: ['./buttons-demo.component.scss'],
})
export class ButtonsDemoComponent {
  // Demo state
  readonly loading = signal(false);

  // Demo methods
  onButtonClick(buttonType: string) {
    console.log(`Button clicked: ${buttonType}`);

    // Simulate loading for demo
    if (buttonType === 'loading') {
      this.loading.set(true);
      setTimeout(() => this.loading.set(false), 2000);
    }
  }
}
