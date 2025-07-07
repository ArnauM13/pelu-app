import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'pelu-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TranslateModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  readonly year = computed(() => new Date().getFullYear());
}
