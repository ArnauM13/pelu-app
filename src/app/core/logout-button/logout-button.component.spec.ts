import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { LogoutButtonComponent } from './logout-button.component';

describe('LogoutButtonComponent', () => {
  let component: LogoutButtonComponent;
  let fixture: ComponentFixture<LogoutButtonComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuth: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authSpy = jasmine.createSpyObj('Auth', ['signOut']);

    await TestBed.configureTestingModule({
      imports: [LogoutButtonComponent],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutButtonComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuth = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render logout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Tancar sessió');
  });

  it('should call logout method when button is clicked', () => {
    spyOn(component, 'logout');

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(component.logout).toHaveBeenCalled();
  });
});
