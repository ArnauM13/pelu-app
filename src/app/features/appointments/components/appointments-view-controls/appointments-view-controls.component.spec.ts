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
      (viewModeChange)="onViewModeChange($event)"
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

  onViewModeChange(_mode: 'list' | 'calendar') {}
}

describe('AppointmentsViewControlsComponent', () => {
  let component: AppointmentsViewControlsComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

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

    // Setup default mock return values with proper observables
    translateSpy.get.and.returnValue(of('translated text'));
    translateSpy.instant.and.returnValue('translated text');
    translateSpy.addLangs.and.returnValue(undefined);
    translateSpy.getBrowserLang.and.returnValue('ca');
    translateSpy.use.and.returnValue(of({}));
    translateSpy.reloadLang.and.returnValue(of({}));
    translateSpy.setDefaultLang.and.returnValue(undefined);
    translateSpy.getDefaultLang.and.returnValue('ca');
    translateSpy.getLangs.and.returnValue(['ca', 'es', 'en', 'ar']);

    await TestBed.configureTestingModule({
      imports: [
        TestWrapperComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            ...translateSpy,
            onLangChange: of({ lang: 'ca', translations: {} }),
            onTranslationChange: of({ lang: 'ca', translations: {} }),
            onDefaultLangChange: of({ lang: 'ca', translations: {} }),
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
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
    const spy = spyOn(component.viewModeChange, 'emit');

    const firstButton = compiled.querySelector('pelu-floating-button');
    firstButton.dispatchEvent(new CustomEvent('clicked'));

    expect(spy).toHaveBeenCalledWith('list');
  });

  it('should emit view mode change when second button is clicked', () => {
    const compiled = fixture.nativeElement;
    const spy = spyOn(component.viewModeChange, 'emit');

    const buttons = compiled.querySelectorAll('pelu-floating-button');
    buttons[1].dispatchEvent(new CustomEvent('clicked'));

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

    expect(viewToggleFab.getAttribute('aria-label')).toBe('translated text');
  });

  it('should have correct role', () => {
    const compiled = fixture.nativeElement;
    const viewToggleFab = compiled.querySelector('.view-toggle-fab');

    expect(viewToggleFab.getAttribute('role')).toBe('group');
  });
});
