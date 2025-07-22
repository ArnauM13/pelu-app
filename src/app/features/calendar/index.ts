// Calendar Feature - Main Exports
export * from './core';
export * from './slots';
export * from './header';
export * from './components';

// Export services individually to avoid naming conflicts
export { CalendarBusinessService } from './services/calendar-business.service';
export { CalendarCoreService } from './services/calendar-core.service';
export { CalendarPositionService } from './services/calendar-position.service';
export type { Position as CalendarPosition } from './services/calendar-position.service';
export { CalendarStateService } from './services/calendar-state.service';

// Export drag-drop services
export { CalendarDragDropService } from './drag-drop/calendar-drag-drop.service';
export type { Position as DragDropPosition } from './drag-drop/calendar-drag-drop.service';
