# Profile Dropdown Component

A reusable profile dropdown component that provides a consistent user menu across the application.

## Features

- ✅ **User Avatar Display**: Shows user avatar with fallback to initials
- ✅ **User Information**: Displays user name and email
- ✅ **Admin Access Control**: Automatically shows admin items for admin users
- ✅ **Customizable Items**: Support for custom menu items
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation
- ✅ **Internationalization**: Supports translation keys

## Usage

### Basic Usage

```typescript
import { ProfileDropdownComponent } from '@shared/components/profile-dropdown';

@Component({
  imports: [ProfileDropdownComponent],
  template: `
    <pelu-profile-dropdown></pelu-profile-dropdown>
  `
})
export class MyComponent {}
```

### With Custom Items

```typescript
import { ProfileDropdownComponent, ProfileDropdownItem } from '@shared/components/profile-dropdown';

@Component({
  imports: [ProfileDropdownComponent],
  template: `
    <pelu-profile-dropdown 
      [customItems]="customItems()"
      (itemClicked)="onItemClicked($event)">
    </pelu-profile-dropdown>
  `
})
export class MyComponent {
  readonly customItems = computed((): ProfileDropdownItem[] => [
    {
      label: 'HELP.MENU',
      icon: 'pi pi-question-circle',
      onClick: () => this.showHelp()
    },
    {
      label: 'SETTINGS.MENU',
      icon: 'pi pi-cog',
      routerLink: '/settings'
    },
    { type: 'divider' },
    {
      label: 'CUSTOM.LOGOUT',
      icon: 'pi pi-sign-out',
      type: 'danger',
      onClick: () => this.customLogout()
    }
  ]);

  onItemClicked(item: ProfileDropdownItem) {
    console.log('Item clicked:', item);
  }
}
```

### Without Admin Items

```typescript
<pelu-profile-dropdown 
  [showAdminItems]="false"
  [customItems]="customItems()">
</pelu-profile-dropdown>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `customItems` | `ProfileDropdownItem[]` | `[]` | Custom menu items to add |
| `showAdminItems` | `boolean` | `true` | Whether to show admin menu items |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `itemClicked` | `ProfileDropdownItem` | Emitted when a menu item is clicked |

## ProfileDropdownItem Interface

```typescript
interface ProfileDropdownItem {
  label?: string;           // Translation key for the item label
  icon?: string;            // CSS class for the icon (e.g., 'pi pi-user')
  routerLink?: string;      // Router link for navigation
  onClick?: () => void;     // Click handler function
  disabled?: boolean;       // Whether the item is disabled
  type?: 'default' | 'danger' | 'divider'; // Item type
}
```

## Default Menu Items

The component automatically includes:

1. **Profile** - Links to `/perfil`
2. **Admin Dashboard** - Links to `/admin/dashboard` (admin users only)
3. **Admin Settings** - Links to `/admin/settings` (admin users only)
4. **Custom Items** - Any items passed via `customItems` input
5. **Logout** - Handled by parent component via `itemClicked` event

## Styling

The component uses CSS custom properties for theming:

```scss
:root {
  --z-popup: 1000;
  --border-color: #e5e7eb;
  --text-color: #374151;
  --text-color-light: #6b7280;
}
```

## Examples

### Header Component Integration

```typescript
// In header.component.ts
readonly customDropdownItems = computed((): ProfileDropdownItem[] => [
  {
    label: 'COMMON.ACTIONS.LOGOUT',
    icon: 'pi pi-sign-out',
    type: 'danger',
    onClick: () => this.onLogout(),
    disabled: this.isLoggingOut()
  }
]);

onDropdownItemClicked(item: ProfileDropdownItem) {
  if (item.onClick) {
    item.onClick();
  }
}
```

```html
<!-- In header.component.html -->
<pelu-profile-dropdown 
  [customItems]="customDropdownItems()"
  (itemClicked)="onDropdownItemClicked($event)">
</pelu-profile-dropdown>
```

## Migration from Header Component

If you're migrating from the old header dropdown implementation:

1. Replace the avatar dropdown HTML with `<pelu-profile-dropdown>`
2. Move custom items to the `customItems` computed property
3. Handle item clicks through the `itemClicked` event
4. Remove old dropdown state management code

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 17+
- PrimeIcons (for icons)
- @ngx-translate/core (for translations) 
