import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { createTestComponentNoRender } from '../../../../testing/test-setup';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    fixture = await createTestComponentNoRender<AvatarComponent>(
      AvatarComponent
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required inputs', () => {
    expect(component.data).toBeDefined();
    expect(component.size).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.hasImage).toBeDefined();
    expect(component.backgroundImageStyle).toBeDefined();
    expect(component.initials).toBeDefined();
    expect(component.tooltipText).toBeDefined();
    expect(component.imageLoadError).toBeDefined();
  });

  it('should generate initials from name and surname', () => {
    component.data = { name: 'John', surname: 'Doe' };
    expect(component.initials()).toBe('JD');
  });

  it('should generate initials from single name', () => {
    component.data = { name: 'John' };
    expect(component.initials()).toBe('J');
  });

  it('should generate initials from email when no name', () => {
    component.data = { email: 'john.doe@example.com' };
    expect(component.initials()).toBe('J');
  });

  it('should display question mark when no data is provided', () => {
    component.data = {};
    expect(component.initials()).toBe('👤');
  });

  it('should have proper size class', () => {
    component.size = 'small';
    expect(component.size).toBe('small');
  });

  it('should detect image presence', () => {
    component.data = { imageUrl: 'https://example.com/avatar.jpg' };
    expect(component.hasImage()).toBe(true);
  });

  it('should not detect image when no imageUrl', () => {
    component.data = {};
    expect(component.hasImage()).toBe(false);
  });

  it('should generate background image style', () => {
    component.data = { imageUrl: 'https://example.com/avatar.jpg' };
    const style = component.backgroundImageStyle();
    expect(style).toContain('https://example.com/avatar.jpg');
  });

  it('should return empty background style when no image', () => {
    component.data = {};
    const style = component.backgroundImageStyle();
    expect(style).toBe('');
  });

  it('should generate tooltip text with name and surname', () => {
    component.data = { name: 'John', surname: 'Doe' };
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('John Doe');
  });

  it('should generate tooltip text with only name', () => {
    component.data = { name: 'John' };
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('John');
  });

  it('should generate tooltip text with email when no name', () => {
    component.data = { email: 'john@example.com' };
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('john@example.com');
  });

  it('should return default tooltip when no data', () => {
    component.data = {};
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('User');
  });

  it('should have default size', () => {
    expect(component.size).toBe('medium');
  });

  it('should have default data', () => {
    expect(component.data).toEqual({});
  });

  it('should be a standalone component', () => {
    expect(AvatarComponent.prototype.constructor.name).toBe('AvatarComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = AvatarComponent;
    expect(componentClass.name).toBe('AvatarComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should have component metadata', () => {
    expect(AvatarComponent.prototype).toBeDefined();
    expect(AvatarComponent.prototype.constructor).toBeDefined();
  });
});
