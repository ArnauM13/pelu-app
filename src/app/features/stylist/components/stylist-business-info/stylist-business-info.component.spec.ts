import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StylistBusinessInfoComponent, BusinessInfo } from './stylist-business-info.component';

describe('StylistBusinessInfoComponent', () => {
  let component: StylistBusinessInfoComponent;
  let fixture: ComponentFixture<StylistBusinessInfoComponent>;

  const mockBusinessInfo: BusinessInfo = {
    businessName: 'Test Salon',
    phone: '+34 123 456 789',
    address: 'Calle Test 123, Barcelona',
    specialties: ['Haircut', 'Coloring', 'Styling']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StylistBusinessInfoComponent,
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

    fixture = TestBed.createComponent(StylistBusinessInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display business information correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('Test Salon');
    expect(compiled.textContent).toContain('+34 123 456 789');
    expect(compiled.textContent).toContain('Calle Test 123, Barcelona');
  });

  it('should display specialties correctly', () => {
    const compiled = fixture.nativeElement;
    const specialtyTags = compiled.querySelectorAll('.specialty-tag');

    expect(specialtyTags.length).toBe(3);
    expect(specialtyTags[0].textContent).toContain('Haircut');
    expect(specialtyTags[1].textContent).toContain('Coloring');
    expect(specialtyTags[2].textContent).toContain('Styling');
  });

  it('should not display specialties section when empty', () => {
    const compiled = fixture.nativeElement;
    const specialtyTags = compiled.querySelectorAll('.specialty-tag');

    expect(specialtyTags.length).toBe(0);
  });

  it('should have correct structure with labels and values', () => {
    const compiled = fixture.nativeElement;
    const infoItems = compiled.querySelectorAll('.info-item');

    expect(infoItems.length).toBe(4); // business name, phone, address, specialties
  });

  it('should display business info title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h2');

    expect(title.textContent).toContain('BUSINESS_INFO');
  });
});
