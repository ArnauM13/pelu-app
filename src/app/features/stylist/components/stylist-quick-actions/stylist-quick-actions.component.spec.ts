import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { StylistQuickActionsComponent, QuickAction } from './stylist-quick-actions.component';

describe('StylistQuickActionsComponent', () => {
  let component: StylistQuickActionsComponent;
  let fixture: ComponentFixture<StylistQuickActionsComponent>;

  const mockActions: QuickAction[] = [
    {
      icon: '📅',
      title: 'STYLIST.MANAGE_APPOINTMENTS',
      description: 'STYLIST.MANAGE_APPOINTMENTS_DESC',
      route: '/stylist/appointments'
    },
    {
      icon: '✂️',
      title: 'STYLIST.SERVICES',
      description: 'STYLIST.SERVICES_DESC',
      route: '/stylist/services'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StylistQuickActionsComponent,
        TranslateModule.forRoot(),
        RouterTestingModule
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

    fixture = TestBed.createComponent(StylistQuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display quick actions correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('📅');
    expect(compiled.textContent).toContain('✂️');
  });

  it('should have correct number of action cards', () => {
    const compiled = fixture.nativeElement;
    const actionCards = compiled.querySelectorAll('.action-card');

    expect(actionCards.length).toBe(2);
  });

  it('should have correct routing links', () => {
    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('a');

    expect(links[0].getAttribute('href')).toBe('/stylist/appointments');
    expect(links[1].getAttribute('href')).toBe('/stylist/services');
  });

  it('should display action titles and descriptions', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('MANAGE_APPOINTMENTS');
    expect(compiled.textContent).toContain('SERVICES');
  });

  it('should display quick actions title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h2');

    expect(title.textContent).toContain('QUICK_ACTIONS');
  });

  it('should have correct structure for action cards', () => {
    const compiled = fixture.nativeElement;
    const firstActionCard = compiled.querySelector('.action-card');

    expect(firstActionCard.querySelector('.action-icon')).toBeTruthy();
    expect(firstActionCard.querySelector('h3')).toBeTruthy();
    expect(firstActionCard.querySelector('p')).toBeTruthy();
  });
});
