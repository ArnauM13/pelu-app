import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputsDemoComponent } from '../../../shared/components/inputs/inputs-demo/inputs-demo.component';
import { ButtonsDemoComponent } from '../../../shared/components/buttons';

@Component({
  selector: 'pelu-playground-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputsDemoComponent,
    ButtonsDemoComponent,
  ],
  templateUrl: './playground-page.component.html',
  styleUrls: ['./playground-page.component.scss'],
})
export class PlaygroundPageComponent {
  // Tab management
  readonly activeTab = signal<'inputs' | 'buttons'>('inputs');

  // Tab switching methods
  setActiveTab(tab: 'inputs' | 'buttons') {
    this.activeTab.set(tab);
  }

  isActiveTab(tab: 'inputs' | 'buttons'): boolean {
    return this.activeTab() === tab;
  }
}
