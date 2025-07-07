import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StylistRecentActivityComponent, ActivityItem } from './stylist-recent-activity.component';

describe('StylistRecentActivityComponent', () => {
  let component: StylistRecentActivityComponent;
  let fixture: ComponentFixture<StylistRecentActivityComponent>;

  const mockActivities: ActivityItem[] = [
    {
      icon: '📅',
      message: 'STYLIST.ACTIVITY_NEW_APPOINTMENT',
      time: 'STYLIST.ACTIVITY_TIME_2_HOURS'
    },
    {
      icon: '✅',
      message: 'STYLIST.ACTIVITY_COMPLETED_APPOINTMENT',
      time: 'STYLIST.ACTIVITY_TIME_4_HOURS'
    },
    {
      icon: '💰',
      message: 'STYLIST.ACTIVITY_PAYMENT_RECEIVED',
      time: 'STYLIST.ACTIVITY_TIME_6_HOURS'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StylistRecentActivityComponent,
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

    fixture = TestBed.createComponent(StylistRecentActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display activities correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('📅');
    expect(compiled.textContent).toContain('✅');
    expect(compiled.textContent).toContain('💰');
  });

  it('should have correct number of activity items', () => {
    const compiled = fixture.nativeElement;
    const activityItems = compiled.querySelectorAll('.activity-item');

    expect(activityItems.length).toBe(3);
  });

  it('should display activity messages and times', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('ACTIVITY_NEW_APPOINTMENT');
    expect(compiled.textContent).toContain('ACTIVITY_COMPLETED_APPOINTMENT');
    expect(compiled.textContent).toContain('ACTIVITY_PAYMENT_RECEIVED');
    expect(compiled.textContent).toContain('ACTIVITY_TIME_2_HOURS');
    expect(compiled.textContent).toContain('ACTIVITY_TIME_4_HOURS');
    expect(compiled.textContent).toContain('ACTIVITY_TIME_6_HOURS');
  });

  it('should display recent activity title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h2');

    expect(title.textContent).toContain('RECENT_ACTIVITY');
  });

  it('should have correct structure for activity items', () => {
    const compiled = fixture.nativeElement;
    const firstActivityItem = compiled.querySelector('.activity-item');

    expect(firstActivityItem.querySelector('.activity-icon')).toBeTruthy();
    expect(firstActivityItem.querySelector('.activity-content')).toBeTruthy();
    expect(firstActivityItem.querySelector('p')).toBeTruthy();
    expect(firstActivityItem.querySelector('.activity-time')).toBeTruthy();
  });

  it('should display correct icons for each activity', () => {
    const compiled = fixture.nativeElement;
    const activityIcons = compiled.querySelectorAll('.activity-icon');

    expect(activityIcons[0].textContent).toContain('📅');
    expect(activityIcons[1].textContent).toContain('✅');
    expect(activityIcons[2].textContent).toContain('💰');
  });
});
