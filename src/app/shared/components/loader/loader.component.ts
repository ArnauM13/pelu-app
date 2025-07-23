import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderService } from '../../services/loader.service';

@Component({
    selector: 'pelu-loader',
    imports: [CommonModule, TranslateModule],
    template: `
    @if (loaderService.isLoading()) {
      <div class="loader-overlay">
        <div class="loader-content">
          <div class="loader-spinner"></div>
          @if (loaderService.config().message) {
            <p class="loader-message">{{ (loaderService.config().message || '') | translate }}</p>
          }
        </div>
      </div>
    }
  `,
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  readonly loaderService = inject(LoaderService);
}
