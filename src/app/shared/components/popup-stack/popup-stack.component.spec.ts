import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupStackComponent, PopupItem } from './popup-stack.component';

describe('PopupStackComponent', () => {
  let component: PopupStackComponent;
  let fixture: ComponentFixture<PopupStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupStackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupStackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input properties defined', () => {
    expect(component.popups).toBeDefined();
  });

  it('should have output properties defined', () => {
    expect(component.popupClosed).toBeDefined();
  });

  it('should initialize with no popups', () => {
    expect(component.popups).toEqual([]);
  });

  it('should have utility methods defined', () => {
    expect(typeof component.onBackdropClick).toBe('function');
  });

  it('should handle backdrop click when popups exist', () => {
    const mockPopup: PopupItem = { id: 'test-popup', component: class MockComponent {}, data: {} };
    component.popups = [mockPopup];

    spyOn(component.popupClosed, 'emit');

    const sameElement = document.createElement('div');
    const mockEvent = {
      target: sameElement,
      currentTarget: sameElement,
    } as unknown as Event;

    component.onBackdropClick(mockEvent);

    expect(component.popupClosed.emit).toHaveBeenCalledWith('test-popup');
  });

  it('should not handle backdrop click when no popups exist', () => {
    component.popups = [];

    spyOn(component.popupClosed, 'emit');

    const sameElement = document.createElement('div');
    const mockEvent = {
      target: sameElement,
      currentTarget: sameElement,
    } as unknown as Event;

    component.onBackdropClick(mockEvent);

    expect(component.popupClosed.emit).not.toHaveBeenCalled();
  });

  it('should not handle backdrop click when target is different from currentTarget', () => {
    const mockPopup: PopupItem = { id: 'test-popup', component: class MockComponent {}, data: {} };
    component.popups = [mockPopup];

    spyOn(component.popupClosed, 'emit');

    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div'),
    } as unknown as Event;

    component.onBackdropClick(mockEvent);

    expect(component.popupClosed.emit).not.toHaveBeenCalled();
  });
});
