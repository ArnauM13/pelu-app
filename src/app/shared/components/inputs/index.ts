// Export specific input components
export {
  InputTextComponent,
  type InputTextConfig,
} from './input-text/input-text.component';
export {
  InputTextareaComponent,
} from './input-textarea/input-textarea.component';
export {
  InputDateComponent,
  type InputDateConfig,
} from './input-date/input-date.component';
export {
  InputNumberComponent,
  type InputNumberConfig,
} from './input-number/input-number.component';
export {
  InputCheckboxComponent,
} from './input-checkbox/input-checkbox.component';
export {
  InputSelectComponent,
  type InputSelectConfig,
  type SelectOption,
} from './input-select/input-select.component';
// Removed input-service-select component as it doesn't exist
// export {
//   InputServiceSelectComponent,
//   type ServiceSelectConfig,
//   type ServiceOption,
// } from './input-service-select/input-service-select.component';
export { InputsDemoComponent } from './inputs-demo/inputs-demo.component';
export { InputTextDemoComponent } from './input-text/input-text-demo.component';

// Re-export for convenience
export * from './input-text/input-text.component';
export * from './input-textarea/input-textarea.component';
export * from './input-date/input-date.component';
export * from './input-number/input-number.component';
export * from './input-checkbox/input-checkbox.component';
export * from './input-select/input-select.component';
// export * from './input-service-select/input-service-select.component';
export * from './inputs-demo/inputs-demo.component';
export * from './input-text/input-text-demo.component';
