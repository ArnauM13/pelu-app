import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'pelu-title',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pelu-title.component.html',
  styleUrls: ['./pelu-title.component.scss'],
})
export class PeluTitleComponent {
  // Component inputs
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
}
