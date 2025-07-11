import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsViewControlsComponent, ViewButton } from './appointments-view-controls.component';

describe('AppointmentsViewControlsComponent', () => {
  let component: AppointmentsViewControlsComponent;
  let fixture: ComponentFixture<AppointmentsViewControlsComponent>;

  const mockViewButtons: ViewButton[] = [
    {
      icon: '📋',
      tooltip: 'COMMON.LIST_VIEW',
      ariaLabel: 'COMMON.LIST_VIEW_LABEL',
      isActive: true,
      variant: 'primary',
      size: 'large'
    },
    {
      icon: '📅',
      tooltip: 'COMMON.CALENDAR_VIEW',
      ariaLabel: 'COMMON.CALENDAR_VIEW_LABEL',
      isActive: false,
      variant: 'primary',
      size: 'large'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppointmentsViewControlsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            get: (key: string) => ({ subscribe: (fn: any) => fn(key) })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsViewControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display view buttons correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('📋');
    expect(compiled.textContent).toContain('📅');
  });

  it('should emit view mode change when first button is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.onViewModeChange, 'emit');

    const firstButton = compiled.querySelector('pelu-floating-button');
    firstButton.click();

    expect(spy).toHaveBeenCalledWith('list');
  });

  it('should emit view mode change when second button is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.onViewModeChange, 'emit');

    const buttons = compiled.querySelectorAll('pelu-floating-button');
    buttons[1].click();

    expect(spy).toHaveBeenCalledWith('calendar');
  });

  it('should have correct number of view buttons', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('pelu-floating-button');

    expect(buttons.length).toBe(2);
  });

  it('should have correct aria-label', () => {
    const compiled = fixture.nativeElement;
    const viewToggleFab = compiled.querySelector('.view-toggle-fab');

    expect(viewToggleFab.getAttribute('aria-label')).toBe('COMMON.CHANGE_VIEW');
  });

  it('should have correct role', () => {
    const compiled = fixture.nativeElement;
    const viewToggleFab = compiled.querySelector('.view-toggle-fab');

    expect(viewToggleFab.getAttribute('role')).toBe('group');
  });
});
