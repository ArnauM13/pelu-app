import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTransitionComponent } from './page-transition.component';

describe('PageTransitionComponent', () => {
  let component: PageTransitionComponent;
  let fixture: ComponentFixture<PageTransitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTransitionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PageTransitionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isEntering input with default value true', () => {
    expect(component.isEntering()).toBe(true);
  });

  it('should have isLeaving input with default value false', () => {
    expect(component.isLeaving()).toBe(false);
  });
});
