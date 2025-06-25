import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoItemComponent, InfoItemData } from './info-item.component';

describe('InfoItemComponent', () => {
  let component: InfoItemComponent;
  let fixture: ComponentFixture<InfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data input signal', () => {
    expect(component.data).toBeDefined();
    expect(typeof component.data).toBe('function');
  });

  it('should have showStatus input signal', () => {
    expect(component.showStatus).toBeDefined();
    expect(typeof component.showStatus).toBe('function');
  });

  it('should have statusClass computed property', () => {
    expect(component.statusClass).toBeDefined();
    expect(typeof component.statusClass).toBe('function');
  });

  it('should have hasStatus computed property', () => {
    expect(component.hasStatus).toBeDefined();
    expect(typeof component.hasStatus).toBe('function');
  });

  it('should have default showStatus value', () => {
    expect(component.showStatus()).toBe(false);
  });
});
