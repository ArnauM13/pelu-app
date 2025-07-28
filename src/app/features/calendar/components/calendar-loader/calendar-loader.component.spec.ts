import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarLoaderComponent } from './calendar-loader.component';

describe('CalendarLoaderComponent', () => {
  let component: CalendarLoaderComponent;
  let fixture: ComponentFixture<CalendarLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading content', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.calendar-loader-title').textContent).toContain(
      'Carregant calendari...'
    );
    expect(compiled.querySelector('.calendar-loader-message').textContent).toContain(
      'Recuperant cites i configuracions'
    );
  });

  it('should have spinner element', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.calendar-loader-spinner')).toBeTruthy();
  });

  it('should have progress bar', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.calendar-loader-progress')).toBeTruthy();
    expect(compiled.querySelector('.calendar-loader-progress-bar')).toBeTruthy();
  });

  it('should have correct CSS classes', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.calendar-loader')).toBeTruthy();
    expect(compiled.querySelector('.calendar-loader-content')).toBeTruthy();
  });
});
