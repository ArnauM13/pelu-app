import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-page-transition',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-transition" [class.entering]="isEntering()" [class.leaving]="isLeaving()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .page-transition {
      animation: fadeInUp 0.6s ease-out;
      opacity: 1;
      transform: translateY(0);
    }

    .page-transition.entering {
      animation: fadeInUp 0.6s ease-out;
    }

    .page-transition.leaving {
      animation: fadeOutDown 0.4s ease-in;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-30px);
      }
    }
  `]
})
export class PageTransitionComponent {
  isEntering = input<boolean>(true);
  isLeaving = input<boolean>(false);
}
