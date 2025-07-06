import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';

import { LandingPageComponent } from './landing-page.component';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'LANDING.HERO_SUBTITLE': 'Reserva el teu moment. Ràpid, fàcil i sense trucades.',
      'LANDING.SERVICES': 'Serveis',
      'LANDING.PROFILE': 'Perfil',
      'LANDING.BOOK_NOW': 'Reservar',
      'LANDING.APPOINTMENTS': 'Cites',
      'COMMON.APP_NAME': 'PeluApp',
      'COMMON.ALL_RIGHTS_RESERVED': 'Tots els drets reservats.'
    });
  }
}

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        RouterTestingModule,
        ButtonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const titleElement = fixture.nativeElement.querySelector('.hero-title');
    expect(titleElement.textContent).toContain('Barberia Soca');
  });

  it('should display the hero subtitle', () => {
    const subtitleElement = fixture.nativeElement.querySelector('.hero-subtitle');
    expect(subtitleElement.textContent).toContain('Reserva el teu moment');
  });

  it('should have four buttons in two groups', () => {
    const buttonGroups = fixture.nativeElement.querySelectorAll('.button-group');
    expect(buttonGroups.length).toBe(2);

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(4);
  });

  it('should have left group with Services and Profile buttons', () => {
    const leftGroup = fixture.nativeElement.querySelector('.left-group');
    const buttons = leftGroup.querySelectorAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Serveis');
    expect(buttons[1].textContent).toContain('Perfil');
  });

  it('should have right group with Book Now and Appointments buttons', () => {
    const rightGroup = fixture.nativeElement.querySelector('.right-group');
    const buttons = rightGroup.querySelectorAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Reservar');
    expect(buttons[1].textContent).toContain('Cites');
  });

  it('should have correct CSS classes for button styling', () => {
    const leftGroup = fixture.nativeElement.querySelector('.left-group');
    const rightGroup = fixture.nativeElement.querySelector('.right-group');

    const servicesButton = leftGroup.querySelector('button');
    const profileButton = leftGroup.querySelectorAll('button')[1];
    const bookButton = rightGroup.querySelector('button');
    const appointmentsButton = rightGroup.querySelectorAll('button')[1];

    expect(servicesButton.classList.contains('btn-services')).toBe(true);
    expect(profileButton.classList.contains('btn-profile')).toBe(true);
    expect(bookButton.classList.contains('btn-primary')).toBe(true);
    expect(appointmentsButton.classList.contains('btn-appointments')).toBe(true);
  });

  it('should have correct router links', () => {
    const leftGroup = fixture.nativeElement.querySelector('.left-group');
    const rightGroup = fixture.nativeElement.querySelector('.right-group');

    const servicesButton = leftGroup.querySelector('button');
    const profileButton = leftGroup.querySelectorAll('button')[1];
    const bookButton = rightGroup.querySelector('button');
    const appointmentsButton = rightGroup.querySelectorAll('button')[1];

    expect(servicesButton.getAttribute('ng-reflect-router-link')).toBe('/services');
    expect(profileButton.getAttribute('ng-reflect-router-link')).toBe('/perfil');
    expect(bookButton.getAttribute('ng-reflect-router-link')).toBe('/booking');
    expect(appointmentsButton.getAttribute('ng-reflect-router-link')).toBe('/appointments');
  });

  it('should display footer with current year', () => {
    const footerElement = fixture.nativeElement.querySelector('.footer');
    const currentYear = new Date().getFullYear();

    expect(footerElement.textContent).toContain(currentYear.toString());
    expect(footerElement.textContent).toContain('PeluApp');
    expect(footerElement.textContent).toContain('Tots els drets reservats');
  });

  it('should have correct year computed value', () => {
    const currentYear = new Date().getFullYear();
    expect(component.year()).toBe(currentYear);
  });
});
