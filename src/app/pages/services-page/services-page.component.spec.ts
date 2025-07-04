import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesPageComponent } from './services-page.component';

describe('ServicesPageComponent', () => {
  let component: ServicesPageComponent;
  let fixture: ComponentFixture<ServicesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ServicesPageComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have services data', () => {
    expect(component.services).toBeDefined();
    expect(component.services.length).toBeGreaterThan(0);
  });

  it('should filter services by category', () => {
    const haircutServices = component.getServicesByCategory('haircut');
    expect(haircutServices.length).toBeGreaterThan(0);
    expect(haircutServices.every(service => service.category === 'haircut')).toBe(true);
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
});
