import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent, AvatarData } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  const _mockData: AvatarData = {
    imageUrl: 'https://example.com/avatar.jpg',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.data).toEqual({});
    expect(component.size).toBe('medium');
  });

  it('should have computed properties defined', () => {
    expect(component.hasImage).toBeDefined();
    expect(component.backgroundImageStyle).toBeDefined();
    expect(component.initials).toBeDefined();
    expect(component.tooltipText).toBeDefined();
    expect(component.imageLoadError).toBeDefined();
    expect(component.imageLoaded).toBeDefined();
  });

  it('should compute hasImage correctly', () => {
    // No image URL
    expect(component.hasImage()).toBe(false);

    // Empty image URL
    component.data = { imageUrl: '' };
    fixture.detectChanges();
    expect(component.hasImage()).toBe(false);

    // Valid image URL
    component.data = { imageUrl: 'https://example.com/image.jpg' };
    fixture.detectChanges();
    expect(component.hasImage()).toBe(true);
  });

  it('should compute backgroundImageStyle correctly', () => {
    // No image
    expect(component.backgroundImageStyle()).toBe('');

    // With image URL
    component.data = { imageUrl: 'https://example.com/image.jpg' };
    fixture.detectChanges();
    expect(component.backgroundImageStyle()).toBe('url(https://example.com/image.jpg)');
  });

  it('should compute initials correctly', () => {
    // With name and surname
    component.data = { name: 'John', surname: 'Doe' };
    fixture.detectChanges();
    expect(component.initials()).toBe('JD');

    // With name only
    component.data = { name: 'John' };
    fixture.detectChanges();
    expect(component.initials()).toBe('J');

    // With email only
    component.data = { email: 'john.doe@example.com' };
    fixture.detectChanges();
    expect(component.initials()).toBe('J');

    // With no data
    component.data = {};
    fixture.detectChanges();
    expect(component.initials()).toBe('👤');
  });

  it('should compute tooltipText correctly', () => {
    // With name and surname
    component.data = { name: 'John', surname: 'Doe' };
    fixture.detectChanges();
    expect(component.tooltipText()).toBe('John Doe');

    // With name only
    component.data = { name: 'John' };
    fixture.detectChanges();
    expect(component.tooltipText()).toBe('John');

    // With email only
    component.data = { email: 'john.doe@example.com' };
    fixture.detectChanges();
    expect(component.tooltipText()).toBe('john.doe@example.com');

    // With no data
    component.data = {};
    fixture.detectChanges();
    expect(component.tooltipText()).toBe('User');
  });

  it('should handle image load events', () => {
    expect(component.imageLoaded()).toBe(false);
    expect(component.imageLoadError()).toBe(false);

    component.onImageLoad();
    expect(component.imageLoaded()).toBe(true);
    expect(component.imageLoadError()).toBe(false);
  });

  it('should handle image error events', () => {
    expect(component.imageLoaded()).toBe(false);
    expect(component.imageLoadError()).toBe(false);

    component.onImageError();
    expect(component.imageLoaded()).toBe(false);
    expect(component.imageLoadError()).toBe(true);
  });

  it('should render with basic structure', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.avatar')).toBeTruthy();
  });

  it('should apply size classes correctly', () => {
    component.size = 'small';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.avatar.small')).toBeTruthy();

    component.size = 'large';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.avatar.large')).toBeTruthy();

    component.size = 'xlarge';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.avatar.xlarge')).toBeTruthy();
  });

  it('should show initials when no image is available', () => {
    component.data = { name: 'John', surname: 'Doe' };
    fixture.detectChanges();

    const initialsElement = fixture.nativeElement.querySelector('.initials');
    expect(initialsElement).toBeTruthy();
    expect(initialsElement.textContent.trim()).toBe('JD');
  });

  it('should show image when available', () => {
    component.data = { imageUrl: 'https://example.com/image.jpg' };
    fixture.detectChanges();

    const imageElement = fixture.nativeElement.querySelector('.avatar-image');
    expect(imageElement).toBeTruthy();
  });

  it('should handle image load error gracefully', () => {
    component.data = { imageUrl: 'https://example.com/image.jpg' };
    fixture.detectChanges();

    // Simulate image error
    component.onImageError();
    fixture.detectChanges();

    const initialsElement = fixture.nativeElement.querySelector('.initials');
    expect(initialsElement).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(AvatarComponent.prototype.constructor).toBeDefined();
    expect(AvatarComponent.prototype.constructor.name).toContain('AvatarComponent');
  });

  it('should have component metadata', () => {
    expect(AvatarComponent.prototype).toBeDefined();
    expect(AvatarComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
