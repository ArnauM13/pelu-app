import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileDropdownComponent, ProfileDropdownItem } from './profile-dropdown.component';

@Component({
  selector: 'pelu-profile-dropdown-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule, ProfileDropdownComponent],
  template: `
    <div class="demo-container">
      <h2>Profile Dropdown Demo</h2>

      <div class="demo-section">
        <h3>Basic Profile Dropdown</h3>
        <pelu-profile-dropdown></pelu-profile-dropdown>
      </div>

      <div class="demo-section">
        <h3>Profile Dropdown with Custom Items</h3>
        <pelu-profile-dropdown
          [customItems]="customItems()"
          (itemClicked)="onCustomItemClicked($event)">
        </pelu-profile-dropdown>
      </div>

      <div class="demo-section">
        <h3>Profile Dropdown without Admin Items</h3>
        <pelu-profile-dropdown
          [showAdminItems]="false"
          [customItems]="customItems()"
          (itemClicked)="onCustomItemClicked($event)">
        </pelu-profile-dropdown>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
    }

    h2 {
      color: #374151;
      margin-bottom: 2rem;
    }

    h3 {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
  `]
})
export class ProfileDropdownDemoComponent {
  readonly customItems = computed((): ProfileDropdownItem[] => [
    {
      label: 'CUSTOM.HELP',
      icon: 'pi pi-question-circle',
      onClick: () => this.showHelp()
    },
    {
      label: 'CUSTOM.SETTINGS',
      icon: 'pi pi-cog',
      routerLink: '/settings'
    },
    {
      type: 'divider'
    },
    {
      label: 'CUSTOM.LOGOUT',
      icon: 'pi pi-sign-out',
      type: 'danger',
      onClick: () => this.customLogout()
    }
  ]);

  showHelp() {
    console.log('Help clicked');
    // Implement help functionality
  }

  customLogout() {
    console.log('Custom logout clicked');
    // Implement custom logout functionality
  }

  onCustomItemClicked(item: ProfileDropdownItem) {
    console.log('Custom item clicked:', item);
  }
}
