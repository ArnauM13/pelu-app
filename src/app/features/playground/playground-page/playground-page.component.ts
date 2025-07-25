import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputsDemoComponent } from '../../../shared/components/inputs/inputs-demo/inputs-demo.component';
import { ButtonsDemoComponent } from '../../../shared/components/buttons';
import { ToastDemoComponent } from '../../../shared/components/toast';

@Component({
  selector: 'pelu-playground-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputsDemoComponent,
    ButtonsDemoComponent,
    ToastDemoComponent,
  ],
  templateUrl: './playground-page.component.html',
  styleUrls: ['./playground-page.component.scss'],
})
export class PlaygroundPageComponent {
  // Tab management
  readonly activeTab = signal<'inputs' | 'buttons' | 'toasts'>('inputs');

  // Tab switching methods
  setActiveTab(tab: 'inputs' | 'buttons' | 'toasts') {
    this.activeTab.set(tab);
  }

  isActiveTab(tab: 'inputs' | 'buttons' | 'toasts'): boolean {
    return this.activeTab() === tab;
  }
}
