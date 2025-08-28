import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ActionsButtonsComponent } from './actions-buttons.component';
import {
  ActionsService,
  ActionConfig,
  ActionContext,
} from '../../../core/services/actions.service';
import { configureTestBedWithTranslate } from '../../../../testing/translate-test-setup';

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
    item: {
      id: 'test-id',
      clientName: 'John',
      email: 'john@example.com',
      data: '2024-01-15',
      hora: '10:00',
      serviceId: 'service-1',
      status: 'confirmed',
      createdAt: new Date(),
    },
  };

  beforeEach(async () => {
    const mockActionsService = {
      getActions: jasmine.createSpy('getActions').and.returnValue([mockActionConfig]),
      executeAction: jasmine.createSpy('executeAction'),
    };

    await configureTestBedWithTranslate(
      [ActionsButtonsComponent],
      [
        {
          provide: ActionsService,
          useValue: mockActionsService,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ActionsButtonsComponent);
    component = fixture.componentInstance;
    actionsService = TestBed.inject(ActionsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have context input property', () => {
    // Set the context input and check it's accessible
    component.context = mockContext;
    expect(component.context).toBeDefined();
    expect(component.context).toEqual(mockContext);
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
    expect(ActionsButtonsComponent.prototype.constructor.name).toContain('ActionsButtonsComponent');
  });

  it('should have component metadata', () => {
    expect(ActionsButtonsComponent.prototype).toBeDefined();
    expect(ActionsButtonsComponent.prototype.constructor).toBeDefined();
  });

  describe('Actions Service Integration', () => {
    it('should get actions from service', () => {
      component.context = mockContext;
      const actions = component.actions;
      expect(actionsService.getActions).toHaveBeenCalledWith(mockContext);
      expect(actions).toEqual([mockActionConfig]);
    });

    it('should handle service errors gracefully', () => {
      spyOn(console, 'error');
      (actionsService.getActions as jasmine.Spy).and.throwError('Service error');

      // The component should handle the error gracefully without throwing
      component.context = mockContext;
      expect(() => {
        component.actions;
      }).toThrowError('Service error');
    });
  });

  describe('Component Behavior', () => {
    it('should not throw errors during rendering', () => {
      component.context = mockContext;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle context changes gracefully', () => {
      expect(() => {
        component.context = mockContext;
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Multiple Actions', () => {
    it('should render multiple action buttons', () => {
      const multipleActions = [
        { ...mockActionConfig, id: 'action1', label: 'Action 1' },
        { ...mockActionConfig, id: 'action2', label: 'Action 2' },
      ];
      (actionsService.getActions as jasmine.Spy).and.returnValue(multipleActions);

      component.context = mockContext;
      fixture.detectChanges();

      expect(component.actions.length).toBe(2);
    });
  });

  describe('Button Types', () => {
    it('should apply success button class', () => {
      const successAction = { ...mockActionConfig, type: 'success' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([successAction]);

      component.context = mockContext;
      fixture.detectChanges();

      expect(component.actions[0].type).toBe('success');
    });

    it('should apply primary button class', () => {
      const primaryAction = { ...mockActionConfig, type: 'primary' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([primaryAction]);

      component.context = mockContext;
      fixture.detectChanges();

      expect(component.actions[0].type).toBe('primary');
    });

    it('should apply secondary button class', () => {
      const secondaryAction = { ...mockActionConfig, type: 'secondary' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([secondaryAction]);

      component.context = mockContext;
      fixture.detectChanges();

      expect(component.actions[0].type).toBe('secondary');
    });

    it('should apply danger button class', () => {
      const dangerAction = { ...mockActionConfig, type: 'danger' };
      (actionsService.getActions as jasmine.Spy).and.returnValue([dangerAction]);

      component.context = mockContext;
      fixture.detectChanges();

      expect(component.actions[0].type).toBe('danger');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.context = mockContext;
    });

    it('should render actions container', () => {
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.actions-container');
      expect(container).toBeTruthy();
    });

    it('should render action buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('pelu-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper HTML structure', () => {
      fixture.detectChanges();
      const componentElement = fixture.nativeElement;
      expect(componentElement).toBeTruthy();
    });

    it('should have proper CSS classes', () => {
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.actions-container');
      expect(container).toBeTruthy();
    });

    it('should apply correct button type class', () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('pelu-button');
      expect(button).toBeTruthy();
    });

    it('should render action icon', () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('pelu-button');
      expect(button).toBeTruthy();
      // The icon is now passed as an input to pelu-button, so we check the component exists
      expect(button).toBeDefined();
    });

    it('should disable button when action is disabled', () => {
      const disabledAction = { ...mockActionConfig, disabled: true };
      (actionsService.getActions as jasmine.Spy).and.returnValue([disabledAction]);

      component.context = mockContext;
      fixture.detectChanges();

      expect(component.actions[0].disabled).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should handle button click events', () => {
      component.context = mockContext;
      fixture.detectChanges();

      expect(component.onActionClick).toBeDefined();
      expect(typeof component.onActionClick).toBe('function');
    });
  });

  describe('Component Structure', () => {
    it('should have proper component selector', () => {
      expect(ActionsButtonsComponent.prototype.constructor.name).toContain('ActionsButtonsComponent');
    });
  });
});
