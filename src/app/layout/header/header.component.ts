import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'pelu-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
    {
      label: 'Booking',
      icon: 'pi pi-calendar',
      routerLink: '/booking',
    },
    {
      label: 'User',
      icon: 'pi pi-envelope',
      routerLink: '/user',
    },
  ];
}
