import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import {
  AppointmentsViewControlsComponent,
  ViewButton,
} from './appointments-view-controls.component';
import { Component, signal } from '@angular/core';
import { of } from 'rxjs';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

// Test wrapper component to provide input signals
@Component({
  template: `
    <pelu-appointments-view-controls
      [viewButtons]="viewButtons()"
      (onViewModeChange)="onViewModeChange($event)"
    >
    </pelu-appointments-view-controls>
  `,
  imports: [AppointmentsViewControlsComponent],
})
class TestWrapperComponent {
  viewButtons = signal<ViewButton[]>([
    {
      icon: '📋',
      tooltip: 'COMMON.LIST_VIEW',
      ariaLabel: 'COMMON.LIST_VIEW_LABEL',
      isActive: true,
      variant: 'primary',
      size: 'large',
    },
    {
      icon: '📅',
      tooltip: 'COMMON.CALENDAR_VIEW',
      ariaLabel: 'COMMON.CALENDAR_VIEW_LABEL',
      isActive: false,
      variant: 'primary',
      size: 'large',
    },
  ]);

  onViewModeChange(mode: 'list' | 'calendar') {}
}

describe('AppointmentsViewControlsComponent', () => {
  let component: AppointmentsViewControlsComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let wrapperComponent: TestWrapperComponent;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const translateSpy = jasmine.createSpyObj('TranslateService', [
      'get',
      'instant',
      'addLangs',
      'getBrowserLang',
      'use',
      'reloadLang',
      'setDefaultLang',
      'getDefaultLang',
      'getLangs',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TestWrapperComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [{ provide: TranslateService, useValue: translateSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default mock return values
    translateService.get.and.returnValue(of('translated text'));
    translateService.instant.and.returnValue('translated text');
    translateService.addLangs.and.returnValue(undefined);
    translateService.getBrowserLang.and.returnValue('ca');
    translateService.use.and.returnValue(of({}));
    translateService.reloadLang.and.returnValue(of({}));
    translateService.setDefaultLang.and.returnValue(undefined);
    translateService.getDefaultLang.and.returnValue('ca');
    translateService.getLangs.and.returnValue(['ca', 'es', 'en', 'ar']);

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
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
