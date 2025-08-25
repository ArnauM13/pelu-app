// Role-based components
export { RoleBasedContentComponent } from './role-based-content/role-based-content.component';
export { AdminSetupComponent } from './admin-setup/admin-setup.component';

// Profile dropdown component
export { ProfileDropdownComponent } from './profile-dropdown';
export type { ProfileDropdownItem } from './profile-dropdown';

// Loader component
export { LoaderComponent } from './loader';
export { LoaderService } from './loader';
export type { LoaderConfig } from './loader';

// Footer component
export { FooterComponent } from './footer';
export type { FooterConfig, FooterAlert } from './footer';

// Title component
export { PeluTitleComponent } from './pelu-title/pelu-title.component';

// Existing components (if any)
// Add other shared components here as needed

// Not found state component
export { NotFoundStateComponent } from './not-found-state/not-found-state.component';
export type { NotFoundStateConfig } from './not-found-state/not-found-state.component';

// Loading state component
export { LoadingStateComponent } from './loading-state/loading-state.component';
export type { LoadingStateConfig } from './loading-state/loading-state.component';

// Alert popup component
export { AlertPopupComponent } from './alert-popup';
export type { AlertData } from './alert-popup';

// Input components
export * from './inputs';

// Button components
export * from './buttons';

// Service card component
export { ServiceCardComponent } from './service-card/service-card.component';

// Card component
export { CardComponent } from './card/card.component';

// Actions buttons component
export { ActionsButtonsComponent } from './actions-buttons';
export type { ActionConfig, ActionContext } from '../../core/services/actions.service';

// Popular badge component
export { PopularBadgeComponent } from './popular-badge/popular-badge.component';
export type { PopularBadgeConfig } from './popular-badge/popular-badge.component';

// No appointments message component
export { NoAppointmentsMessageComponent } from './no-appointments-message/no-appointments-message.component';
