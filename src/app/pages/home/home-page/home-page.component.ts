import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { HeaderComponent } from '../../../layout/header/header.component';

@Component({
  selector: 'pelu-home-page',
  standalone: true,
  imports: [CommonModule, TabViewModule, HeaderComponent],
  templateUrl: './home-page.component.html',
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class HomePageComponent {}
