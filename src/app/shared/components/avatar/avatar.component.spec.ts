import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { configureTestBed, resetMocks, setupDefaultMocks } from '../../../../testing/test-setup';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    setupDefaultMocks();

    await configureTestBed([AvatarComponent]).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;

    resetMocks();
    fixture.detectChanges();
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
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(component.initials()).toBe('JD');
  });

  it('should generate initials from single name', () => {
    component.data = { name: 'John' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(component.initials()).toBe('J');
  });

  it('should generate initials from email when no name', () => {
    component.data = { email: 'john.doe@example.com' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(component.initials()).toBe('J');
  });

  it('should display question mark when no data is provided', () => {
    component.data = {};
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(component.initials()).toBe('👤');
  });

  it('should detect image presence', () => {
    component.data = { imageUrl: 'https://example.com/avatar.jpg' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(component.hasImage()).toBe(true);
  });

  it('should not detect image when no imageUrl', () => {
    component.data = {};
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    expect(component.hasImage()).toBe(false);
  });

  it('should generate background image style', () => {
    component.data = { imageUrl: 'https://example.com/avatar.jpg' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const style = component.backgroundImageStyle();
    expect(style).toContain('https://example.com/avatar.jpg');
  });

  it('should return empty background style when no image', () => {
    component.data = {};
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const style = component.backgroundImageStyle();
    expect(style).toBe('');
  });

  it('should generate tooltip text with name and surname', () => {
    component.data = { name: 'John', surname: 'Doe' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('John Doe');
  });

  it('should generate tooltip text with only name', () => {
    component.data = { name: 'John' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('John');
  });

  it('should generate tooltip text with email when no name', () => {
    component.data = { email: 'john@example.com' };
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('john@example.com');
  });

  it('should return default tooltip when no data', () => {
    component.data = {};
    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    const tooltipText = component.tooltipText();
    expect(tooltipText).toBe('User');
  });

  it('should have default size', () => {
    expect(component.size).toBe('medium');
  });

  it('should have default data', () => {
    expect(component.data).toEqual({});
  });
});
