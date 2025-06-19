import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { HeaderComponent } from '../../../layout/header/header.component';

@Component({
  selector: 'pelu-home-page',
  standalone: true,
  imports: [CommonModule, TabViewModule, HeaderComponent],
  template: `
    <pelu-header></pelu-header>

    <p-tabView>
      <p-tabPanel header="Reserves">
        <p>Aquí aniran les reserves de clients 🗓️</p>
      </p-tabPanel>
      <p-tabPanel header="Clients">
        <p>Llistat de clients 💇</p>
      </p-tabPanel>
      <p-tabPanel header="Serveis">
        <p>Gestió dels serveis que oferim ✂️</p>
      </p-tabPanel>
      <p-tabPanel header="Configuració">
        <p>Configuració de l'aplicació ⚙️</p>
      </p-tabPanel>
    </p-tabView>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class HomePageComponent {}
