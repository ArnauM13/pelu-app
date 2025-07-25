import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputsDemoComponent } from '../../../shared/components/inputs/inputs-demo/inputs-demo.component';

@Component({
  selector: 'pelu-playground-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputsDemoComponent,
  ],
  templateUrl: './playground-page.component.html',
  styleUrls: ['./playground-page.component.scss'],
})
export class PlaygroundPageComponent {
  // This is a playground page for testing and demonstrating components
}
