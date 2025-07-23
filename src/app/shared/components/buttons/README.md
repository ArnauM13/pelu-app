# Pelu Button Component

A standardized button component that wraps PrimeNG's ButtonModule, providing a consistent API and user experience across the application.

## Features

- ✅ **All PrimeNG Button features** supported
- ✅ **Consistent API** following the same pattern as input components
- ✅ **Application styling** maintained through `styles-primeng.scss`
- ✅ **TypeScript support** with proper typing
- ✅ **Accessibility** features included
- ✅ **Responsive design** with mobile-friendly touch targets
- ✅ **Multiple variants** (filled, outlined, text, link)
- ✅ **Multiple severities** (primary, secondary, success, info, warn, help, danger, contrast)
- ✅ **Multiple sizes** (small, large)
- ✅ **Icon support** with positioning options
- ✅ **Loading states** with spinner
- ✅ **Form integration** (submit, reset, button types)
- ✅ **Custom gradients** and hover effects matching the app theme

## Installation

The component is automatically available when importing from the shared components:

```typescript
import { ButtonComponent } from '@shared/components';
```

## Application Styling

The button component automatically inherits the application's custom styling system defined in `styles-primeng.scss`. This ensures:

- **Consistent appearance** across all components
- **Custom gradients** and color schemes
- **Smooth transitions** and hover effects
- **Proper focus states** for accessibility
- **Responsive design** for mobile devices

The styling includes custom CSS variables that match the application's design system:
- `--gradient-primary`, `--gradient-secondary`, `--gradient-success`, etc.
- `--primary-color`, `--secondary-color`, `--success-color`, etc.
- `--border-radius`, `--box-shadow`, `--box-shadow-hover`, etc.

## Basic Usage

```html
<!-- Basic button -->
<pelu-button
  label="Click me"
  (clicked)="onButtonClick($event)">
</pelu-button>

<!-- Button with icon -->
<pelu-button
  label="Save"
  icon="pi pi-check"
  severity="success"
  (clicked)="onSave()">
</pelu-button>

<!-- Disabled button -->
<pelu-button
  label="Disabled"
  [disabled]="true">
</pelu-button>
```

## API Reference

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string` | `''` | Text to display on the button |
| `icon` | `string` | `''` | Icon class (e.g., 'pi pi-check') |
| `iconPos` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Position of the icon relative to the label |
| `severity` | `'primary' \| 'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | `'primary'` | Visual severity of the button |
| `variant` | `'filled' \| 'outlined' \| 'text'` | `'filled'` | Visual variant of the button |
| `size` | `'small' \| 'large'` | `'small'` | Size of the button |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether to show loading spinner |
| `raised` | `boolean` | `false` | Whether to show elevation shadow |
| `rounded` | `boolean` | `false` | Whether to use rounded corners |
| `link` | `boolean` | `false` | Whether to render as a link |
| `fluid` | `boolean` | `false` | Whether to span full width |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `name` | `string` | `''` | HTML name attribute |
| `id` | `string` | `''` | HTML id attribute |
| `class` | `string` | `''` | Additional CSS classes |
| `style` | `string` | `''` | Inline styles |
| `ariaLabel` | `string` | `''` | Accessibility label |

### Outputs

| Property | Type | Description |
|----------|------|-------------|
| `clicked` | `Event` | Emitted when the button is clicked |

## Examples

### Basic Buttons

```html
<!-- Primary button -->
<pelu-button label="Primary"></pelu-button>

<!-- Secondary button -->
<pelu-button 
  label="Secondary" 
  severity="secondary">
</pelu-button>

<!-- Success button -->
<pelu-button 
  label="Success" 
  severity="success">
</pelu-button>

<!-- Danger button -->
<pelu-button 
  label="Danger" 
  severity="danger">
</pelu-button>
```

### Button Variants

```html
<!-- Filled (default) -->
<pelu-button label="Filled"></pelu-button>

<!-- Outlined -->
<pelu-button 
  label="Outlined" 
  variant="outlined">
</pelu-button>

<!-- Text -->
<pelu-button 
  label="Text" 
  variant="text">
</pelu-button>

<!-- Link -->
<pelu-button 
  label="Link" 
  [link]="true">
</pelu-button>
```

### Button Sizes

```html
<!-- Small (default) -->
<pelu-button 
  label="Small" 
  [size]="'small'">
</pelu-button>

<!-- Large -->
<pelu-button 
  label="Large" 
  [size]="'large'">
</pelu-button>
```

### Buttons with Icons

```html
<!-- Icon on the left (default) -->
<pelu-button 
  label="Save" 
  icon="pi pi-check">
</pelu-button>

<!-- Icon on the right -->
<pelu-button 
  label="Delete" 
  icon="pi pi-trash" 
  iconPos="right" 
  severity="danger">
</pelu-button>

<!-- Icon only -->
<pelu-button 
  icon="pi pi-home" 
  [ariaLabel]="'Home'">
</pelu-button>

<!-- Icon on top -->
<pelu-button 
  label="Refresh" 
  icon="pi pi-refresh" 
  iconPos="top">
</pelu-button>
```

### Button States

```html
<!-- Loading state -->
<pelu-button 
  label="Loading..." 
  icon="pi pi-spinner" 
  [loading]="true">
</pelu-button>

<!-- Disabled state -->
<pelu-button 
  label="Disabled" 
  [disabled]="true">
</pelu-button>

<!-- Raised (with shadow) -->
<pelu-button 
  label="Raised" 
  [raised]="true">
</pelu-button>

<!-- Rounded -->
<pelu-button 
  label="Rounded" 
  [rounded]="true">
</pelu-button>
```

### Form Buttons

```html
<!-- Submit button -->
<pelu-button 
  label="Submit" 
  type="submit" 
  icon="pi pi-send">
</pelu-button>

<!-- Reset button -->
<pelu-button 
  label="Reset" 
  type="reset" 
  severity="secondary" 
  icon="pi pi-times">
</pelu-button>
```

### Complex Examples

```html
<!-- Create appointment button -->
<pelu-button
  label="Crear Cita"
  icon="pi pi-calendar-plus"
  severity="success"
  [raised]="true"
  [size]="'large'"
  (clicked)="createAppointment()">
</pelu-button>

<!-- Cancel appointment button -->
<pelu-button
  label="Cancel·lar Cita"
  icon="pi pi-times"
  severity="danger"
  variant="outlined"
  (clicked)="cancelAppointment()">
</pelu-button>

<!-- Edit profile button -->
<pelu-button
  label="Editar Perfil"
  icon="pi pi-user-edit"
  severity="info"
  variant="text"
  (clicked)="editProfile()">
</pelu-button>
```

## Styling

The component uses the application's custom styling system defined in `styles-primeng.scss`, which maintains consistency with the overall design. The styling includes:

- **Custom gradients** and color schemes matching the application theme
- **Consistent spacing** and typography
- **Hover effects** with smooth transitions
- **Focus states** with proper accessibility indicators
- **Responsive design** optimized for mobile devices

Custom styles can be applied using:

1. **CSS Classes**: Use the `class` input to add custom CSS classes
2. **Inline Styles**: Use the `style` input for inline styles
3. **Global Overrides**: Override styles in `styles-primeng.scss` for application-wide changes

### Custom Styling Example

```html
<pelu-button
  label="Custom Button"
  class="my-custom-button"
  severity="success"
  [raised]="true">
</pelu-button>
```

```scss
.my-custom-button {
  .p-button {
    // Override specific properties while maintaining the app's design system
    background: var(--gradient-success) !important;
    border-color: var(--success-color) !important;
    box-shadow: var(--box-shadow-hover) !important;
  }
}
```

## Accessibility

The component includes several accessibility features:

- **ARIA Labels**: Use `ariaLabel` for icon-only buttons
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper semantic markup
- **Focus Management**: Visible focus indicators
- **Touch Targets**: Minimum 44px height on mobile

## Migration from Existing Buttons

### From PrimeNG p-button

```html
<!-- Before -->
<p-button label="Save" icon="pi pi-check" severity="success"></p-button>

<!-- After -->
<pelu-button 
  label="Save" 
  icon="pi pi-check" 
  severity="success">
</pelu-button>
```

### From Custom Button Classes

```html
<!-- Before -->
<button class="btn btn-primary">Save</button>

<!-- After -->
<pelu-button label="Save" severity="primary"></pelu-button>
```

## Demo

See the `ButtonsDemoComponent` for a comprehensive showcase of all button features and variants.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- Angular 17+
- PrimeNG 20+
- Prime Icons 
