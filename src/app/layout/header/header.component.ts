import { Component } from '@angular/core';

@Component({
  selector: 'pelu-header',
  standalone: true,
  template: `
    <header class="header">
      <h1>Perruqueria XYZ</h1>
    </header>
  `,
  styles: [`
    .header {
      padding: 1rem;
      background-color: #6200ea;
      color: white;
      font-size: 1.5rem;
    }
  `]
})
export class HeaderComponent {}
