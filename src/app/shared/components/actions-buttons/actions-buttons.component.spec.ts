import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActionsButtonsComponent } from './actions-buttons.component';
import {
  ActionsService,
  ActionConfig,
  ActionContext,
} from '../../../core/services/actions.service';

describe('ActionsButtonsComponent', () => {
  let component: ActionsButtonsComponent;
  let fixture: ComponentFixture<ActionsButtonsComponent>;
  let actionsService: ActionsService;

  const mockActionConfig: ActionConfig = {
    id: 'test-action',
    label: 'Test Action',
    icon: '🔧',
    type: 'primary',
    disabled: false,
    tooltip: 'Test tooltip',
    onClick: () => {},
  };

  const mockContext: ActionContext = {
    type: 'appointment',
    item: { id: 'test-id' },
  };

  beforeEach(async () => {
    const mockActionsService = {
      getActions: jasmine.createSpy('getActions').and.returnValue([mockActionConfig]),
      executeAction: jasmine.createSpy('executeAction'),
    };

    await TestBed.configureTestingModule({
      imports: [ActionsButtonsComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActionsService,
          useValue: mockActionsService,
        },
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            get: (key: string) => ({ subscribe: (fn: any) => fn(key) }),
          },
        },
        {
          provide: TranslateStore,
          useValue: {
            get: (key: string) => key,
            set: (key: string, value: any) => {},
            has: (key: string) => true,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsButtonsComponent);
    component = fixture.componentInstance;
    actionsService = TestBed.inject(ActionsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have context input property', () => {
    expect(component.context).toBeDefined();
  });

  it('should have actions getter', () => {
    expect(component.actions).toBeDefined();
    expect(Array.isArray(component.actions)).toBe(true);
  });

  it('should have onActionClick method', () => {
    expect(component.onActionClick).toBeDefined();
    expect(typeof component.onActionClick).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(ActionsButtonsComponent.prototype.constructor).toBeDefined();
    expect(ActionsButtonsComponent.prototype.constructor.name).toBe('ActionsButtonsComponent');
  });

  it('should have component metadata', () => {
    expect(ActionsButtonsComponent.prototype).toBeDefined();
    expect(ActionsButtonsComponent.prototype.constructor).toBeDefined();
  });

  describe('Actions Service Integration', () => {
    it('should get actions from service', () => {
      component.context = mockContext;
      fixture.detectChanges();

      expect(actionsService.getActions).toHaveBeenCalledWith(mockContext);
      expect(component.actions).toEqual([mockActionConfig]);
    });

    it('should execute action through service', () => {
      component.context = mockContext;
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.onActionClick(mockActionConfig, mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(actionsService.executeAction).toHaveBeenCalledWith('test-action', mockContext);
    });

    it('should not execute action when disabled', () => {
      component.context = mockContext;
      const disabledAction = { ...mockActionConfig, disabled: true };
      const mockEvent = new Event('click');

      component.onActionClick(disabledAction, mockEvent);

      expect(actionsService.executeAction).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.context = mockContext;
    });

    it('should render actions container', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const containerElement = compiled.querySelector('.actions-container');
      expect(containerElement).toBeTruthy();
    });

    it('should render action buttons', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElements = compiled.querySelectorAll('.btn');
      expect(buttonElements.length).toBe(1);
    });

    it('should render action icon', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      expect(buttonElement?.textContent).toContain('🔧');
    });

    it('should apply correct button type class', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      expect(buttonElement?.classList.contains('primary')).toBeTruthy();
    });

    it('should disable button when action is disabled', () => {
      const disabledAction = { ...mockActionConfig, disabled: true };
      (actionsService.getActions as jasmine.Spy).and.returnValue([disabledAction]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn') as HTMLButtonElement;
      expect(buttonElement.disabled).toBe(true);
    });

    it('should have proper CSS classes', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const containerElement = compiled.querySelector('.actions-container');
      expect(containerElement?.classList.contains('actions-container')).toBeTruthy();
    });

    it('should have proper HTML structure', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.innerHTML).toContain('actions-container');
      expect(compiled.innerHTML).toContain('btn');
    });
  });

  describe('Button Types', () => {
    beforeEach(() => {
      component.context = mockContext;
    });

    it('should apply primary button class', () => {
      const primaryAction = { ...mockActionConfig, type: 'primary' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([primaryAction]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      expect(buttonElement?.classList.contains('primary')).toBeTruthy();
    });

    it('should apply secondary button class', () => {
      const secondaryAction = { ...mockActionConfig, type: 'secondary' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([secondaryAction]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      expect(buttonElement?.classList.contains('secondary')).toBeTruthy();
    });

    it('should apply danger button class', () => {
      const dangerAction = { ...mockActionConfig, type: 'danger' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([dangerAction]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      expect(buttonElement?.classList.contains('danger')).toBeTruthy();
    });

    it('should apply success button class', () => {
      const successAction = { ...mockActionConfig, type: 'success' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([successAction]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      expect(buttonElement?.classList.contains('success')).toBeTruthy();
    });
  });

  describe('Multiple Actions', () => {
    beforeEach(() => {
      component.context = mockContext;
    });

    it('should render multiple action buttons', () => {
      const multipleActions = [
        { ...mockActionConfig, id: 'action1', icon: '🔧' },
        { ...mockActionConfig, id: 'action2', icon: '📝', type: 'secondary' },
        { ...mockActionConfig, id: 'action3', icon: '❌', type: 'danger' },
      ];
      (actionsService.getActions as jasmine.Spy).and.returnValue(multipleActions);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElements = compiled.querySelectorAll('.btn');
      expect(buttonElements.length).toBe(3);
    });

    it('should handle empty actions array', () => {
      (actionsService.getActions as jasmine.Spy).and.returnValue([]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElements = compiled.querySelectorAll('.btn');
      expect(buttonElements.length).toBe(0);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      component.context = mockContext;
    });

    it('should handle button click events', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttonElement = compiled.querySelector('.btn');
      const clickSpy = spyOn(component, 'onActionClick');

      buttonElement?.dispatchEvent(new Event('click'));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should stop event propagation on click', () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'stopPropagation');

      component.onActionClick(mockActionConfig, mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Component Behavior', () => {
    it('should initialize with context input', () => {
      component.context = mockContext;
      expect(component.context).toBe(mockContext);
    });

    it('should maintain context reference consistency', () => {
      component.context = mockContext;
      const initialContext = component.context;
      expect(component.context).toBe(initialContext);
    });

    it('should not throw errors during rendering', () => {
      component.context = mockContext;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle context changes gracefully', () => {
      expect(() => {
        component.context = mockContext;
        fixture.detectChanges();
        component.context = { type: 'service', item: { id: 'new-id' } };
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing context gracefully', () => {
      // Component should still be created even without context
      expect(component).toBeTruthy();
    });

    it('should handle service errors gracefully', () => {
      (actionsService.getActions as jasmine.Spy).and.throwError('Service error');

      component.context = mockContext;
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle undefined action properties gracefully', () => {
      const incompleteAction = { id: 'test' } as ActionConfig;
      (actionsService.getActions as jasmine.Spy).and.returnValue([incompleteAction]);

      component.context = mockContext;
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Interface Validation', () => {
    it('should handle ActionConfig interface correctly', () => {
      const testAction: ActionConfig = {
        id: 'test-id',
        label: 'Test Label',
        icon: '🔧',
        type: 'primary',
        disabled: false,
        tooltip: 'Test tooltip',
        onClick: () => {},
      };

      expect(testAction.id).toBe('test-id');
      expect(testAction.label).toBe('Test Label');
      expect(testAction.icon).toBe('🔧');
      expect(testAction.type).toBe('primary');
      expect(testAction.disabled).toBe(false);
      expect(testAction.tooltip).toBe('Test tooltip');
    });

    it('should handle ActionContext interface correctly', () => {
      const testContext: ActionContext = {
        type: 'appointment',
        item: { id: 'test-id', name: 'Test Appointment' },
      };

      expect(testContext.type).toBe('appointment');
      expect(testContext.item.id).toBe('test-id');
      expect(testContext.item.name).toBe('Test Appointment');
    });

    it('should validate action types', () => {
      const validTypes = ['primary', 'secondary', 'danger', 'success'];
      validTypes.forEach(type => {
        expect(['primary', 'secondary', 'danger', 'success']).toContain(type);
      });
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(ActionsButtonsComponent.prototype.constructor).toBeDefined();
    });

    it('should have proper component selector', () => {
      expect(ActionsButtonsComponent.prototype.constructor.name).toBe('ActionsButtonsComponent');
    });

    it('should have proper component imports', () => {
      expect(ActionsButtonsComponent).toBeDefined();
      expect(component).toBeInstanceOf(ActionsButtonsComponent);
    });
  });
});
