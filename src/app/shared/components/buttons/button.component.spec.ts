import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, ButtonModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render p-button with default properties', () => {
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('p-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.label()).toBe('');
    expect(component.icon()).toBe('');
    expect(component.iconPos()).toBe('left');
    expect(component.severity()).toBe('primary');
    expect(component.variant()).toBe(undefined);
    expect(component.size()).toBe(undefined);
    expect(component.disabled()).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('should emit click event when button is clicked', () => {
    const clickSpy = jasmine.createSpy('click');
    component.clicked.subscribe(clickSpy);

    fixture.detectChanges();

    // Call the onButtonClick method directly since p-button doesn't expose click events easily in tests
    const mockEvent = new Event('click');
    component.onButtonClick(mockEvent);

    expect(clickSpy).toHaveBeenCalledWith(mockEvent);
  });
});
