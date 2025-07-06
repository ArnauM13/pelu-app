import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { ServicesPageComponent } from './services-page.component';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'LANDING.SERVICES': 'Serveis',
      'LANDING.PROFILE': 'Perfil',
      'LANDING.BOOK_NOW': 'Reservar',
      'LANDING.APPOINTMENTS': 'Cites'
    });
  }
}

describe('ServicesPageComponent', () => {
  let component: ServicesPageComponent;
  let fixture: ComponentFixture<ServicesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ServicesPageComponent,
        RouterTestingModule,
        ButtonModule,
        CardModule,
        TagModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const titleElement = fixture.nativeElement.querySelector('h1');
    expect(titleElement.textContent).toContain('Els Nostres Serveis');
  });

  it('should display the info note about being informational', () => {
    const infoNote = fixture.nativeElement.querySelector('.info-note');
    expect(infoNote.textContent).toContain('Pàgina informativa');
    expect(infoNote.textContent).toContain('visita el calendari');
  });

  it('should have four service categories', () => {
    const categoryHeaders = fixture.nativeElement.querySelectorAll('.category-header h2');
    expect(categoryHeaders.length).toBe(4);
  });

    it('should display correct category names', () => {
    const categoryHeaders = fixture.nativeElement.querySelectorAll('.category-header h2');
    const categoryNames = Array.from(categoryHeaders).map((h: any) => h.textContent);

    expect(categoryNames).toContain('Cortes');
    expect(categoryNames).toContain('Barba');
    expect(categoryNames).toContain('Tractaments');
    expect(categoryNames).toContain('Peinats');
  });

  it('should display correct category icons', () => {
    const categoryIcons = fixture.nativeElement.querySelectorAll('.category-icon');
    const iconTexts = Array.from(categoryIcons).map((icon: any) => icon.textContent);

    expect(iconTexts).toContain('✂️');
    expect(iconTexts).toContain('🧔');
    expect(iconTexts).toContain('💆');
    expect(iconTexts).toContain('💇');
  });

  it('should have services in each category', () => {
    const serviceCards = fixture.nativeElement.querySelectorAll('.service-card');
    expect(serviceCards.length).toBeGreaterThan(0);
  });

  it('should display service information correctly', () => {
    const firstServiceCard = fixture.nativeElement.querySelector('.service-card');
    if (firstServiceCard) {
      const serviceName = firstServiceCard.querySelector('h3');
      const serviceDescription = firstServiceCard.querySelector('.service-description');
      const serviceDuration = firstServiceCard.querySelector('.duration');
      const servicePrice = firstServiceCard.querySelector('.price');

      expect(serviceName).toBeTruthy();
      expect(serviceDescription).toBeTruthy();
      expect(serviceDuration).toBeTruthy();
      expect(servicePrice).toBeTruthy();
    }
  });

    it('should not have any booking buttons', () => {
    const bookingButtons = fixture.nativeElement.querySelectorAll('button[class*="btn"]');
    const hasBookingButton = Array.from(bookingButtons).some((button: any) =>
      button.textContent.includes('Reservar') ||
      button.textContent.includes('Book')
    );
    expect(hasBookingButton).toBe(false);
  });

  it('should display popular tags for popular services', () => {
    const popularTags = fixture.nativeElement.querySelectorAll('p-tag');
    expect(popularTags.length).toBeGreaterThan(0);
  });

  it('should have correct service categories configuration', () => {
    expect(component.serviceCategories.length).toBe(4);

    const haircutCategory = component.serviceCategories.find(cat => cat.id === 'haircut');
    const beardCategory = component.serviceCategories.find(cat => cat.id === 'beard');
    const treatmentCategory = component.serviceCategories.find(cat => cat.id === 'treatment');
    const stylingCategory = component.serviceCategories.find(cat => cat.id === 'styling');

    expect(haircutCategory).toBeTruthy();
    expect(beardCategory).toBeTruthy();
    expect(treatmentCategory).toBeTruthy();
    expect(stylingCategory).toBeTruthy();
  });

    it('should have services array with correct structure', () => {
    expect(component.services.length).toBeGreaterThan(0);

    const firstService = component.services[0];
    expect(firstService.id).toBeDefined();
    expect(firstService.name).toBeDefined();
    expect(firstService.description).toBeDefined();
    expect(firstService.price).toBeDefined();
    expect(firstService.duration).toBeDefined();
    expect(firstService.category).toBeDefined();
    expect(firstService.icon).toBeDefined();
  });

  it('should filter services by category correctly', () => {
    const haircutServices = component.getServicesByCategory('haircut');
    const beardServices = component.getServicesByCategory('beard');

    expect(haircutServices.every(service => service.category === 'haircut')).toBe(true);
    expect(beardServices.every(service => service.category === 'beard')).toBe(true);
  });

  it('should return correct category names', () => {
    expect(component.getCategoryName('haircut')).toBe('Cortes');
    expect(component.getCategoryName('beard')).toBe('Barba');
    expect(component.getCategoryName('treatment')).toBe('Tractaments');
    expect(component.getCategoryName('styling')).toBe('Peinats');
  });

  it('should return correct category icons', () => {
    expect(component.getCategoryIcon('haircut')).toBe('✂️');
    expect(component.getCategoryIcon('beard')).toBe('🧔');
    expect(component.getCategoryIcon('treatment')).toBe('💆');
    expect(component.getCategoryIcon('styling')).toBe('💇');
  });

  it('should display footer with pricing note', () => {
    const footerElement = fixture.nativeElement.querySelector('.services-footer');
    expect(footerElement.textContent).toContain('Preus orientatius');
    expect(footerElement.textContent).toContain('complexitat del servei');
  });

  it('should have return to home button', () => {
    const homeButton = fixture.nativeElement.querySelector('button[routerlink="/"]');
    expect(homeButton).toBeTruthy();
    expect(homeButton.textContent).toContain('Tornar a l\'inici');
  });
});
