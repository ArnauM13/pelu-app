import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/components/buttons/button.component';
import { PeluTitleComponent } from '../../shared/components/pelu-title/pelu-title.component';

@Component({
  selector: 'pelu-landing',
  imports: [CommonModule, RouterModule, CardModule, TranslateModule, ButtonComponent, PeluTitleComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  readonly year = computed(() => new Date().getFullYear());
}
