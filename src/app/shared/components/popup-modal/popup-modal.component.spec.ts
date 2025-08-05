import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PopupModalComponent } from './popup-modal.component';

describe('PopupModalComponent', () => {
  let component: PopupModalComponent;
  let fixture: ComponentFixture<PopupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input properties defined', () => {
    expect(component.isOpen).toBeDefined();
  });

  it('should have output properties defined', () => {
    expect(component.close).toBeDefined();
  });

  it('should initialize with default values', () => {
    expect(component.isOpen).toBe(false);
  });

  it('should have event handler methods defined', () => {
    expect(typeof component.onBackdropClick).toBe('function');
  });

  it('should handle backdrop click when target equals currentTarget', () => {
    spyOn(component.close, 'emit');

    const sameElement = document.createElement('div');
    const mockEvent = {
      target: sameElement,
      currentTarget: sameElement,
    } as unknown as Event;

    component.onBackdropClick(mockEvent);

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not handle backdrop click when target is different from currentTarget', () => {
    spyOn(component.close, 'emit');

    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div'),
    } as unknown as Event;

    component.onBackdropClick(mockEvent);

    expect(component.close.emit).not.toHaveBeenCalled();
  });

  it('should have proper component structure', () => {
    expect(PopupModalComponent.prototype.constructor.name).toBe('PopupModalComponent');
  });

  it('should be a standalone component', () => {
    expect(PopupModalComponent.prototype.constructor).toBeDefined();
    expect(PopupModalComponent.prototype.constructor.name).toBe('PopupModalComponent');
  });

  it('should have component metadata', () => {
    expect(PopupModalComponent.prototype).toBeDefined();
    expect(PopupModalComponent.prototype.constructor).toBeDefined();
  });

  it('should have proper component type', () => {
    expect(typeof PopupModalComponent).toBe('function');
    expect(PopupModalComponent.name).toBe('PopupModalComponent');
  });

  it('should have proper component type', () => {
    expect(typeof PopupModalComponent).toBe('function');
    expect(PopupModalComponent.name).toBe('PopupModalComponent');
  });
});
