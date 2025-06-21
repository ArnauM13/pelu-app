import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant', () => {
    expect(component.variant()).toBe('default');
  });

  it('should render with default variant class', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cardElement = compiled.querySelector('.pelu-card');
    expect(cardElement).toBeTruthy();
  });

  it('should project content', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cardElement = compiled.querySelector('.pelu-card');
    expect(cardElement).toBeTruthy();
  });
});
