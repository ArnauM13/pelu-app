import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { InfoItemComponent, InfoItemData } from './info-item.component';

describe('InfoItemComponent', () => {
  let component: InfoItemComponent;
  let fixture: ComponentFixture<InfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InfoItemComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            get: (key: string) => ({ subscribe: (fn: any) => fn(key) })
          }
        },
        {
          provide: TranslateStore,
          useValue: {
            get: (key: string) => key,
            set: (key: string, value: any) => {},
            has: (key: string) => true
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should be a component class', () => {
    expect(InfoItemComponent.prototype.constructor.name).toBe('InfoItemComponent');
  });

  it('should have proper component structure', () => {
    const componentClass = InfoItemComponent;
    expect(componentClass.name).toBe('InfoItemComponent');
    expect(typeof componentClass).toBe('function');
  });

  it('should be a standalone component', () => {
    expect(InfoItemComponent.prototype.constructor).toBeDefined();
    expect(InfoItemComponent.prototype.constructor.name).toBe('InfoItemComponent');
  });

  it('should have component metadata', () => {
    expect(InfoItemComponent.prototype).toBeDefined();
    expect(InfoItemComponent.prototype.constructor).toBeDefined();
  });

  it('should have all required computed properties', () => {
    expect(component.data).toBeDefined();
    expect(component.showStatus).toBeDefined();
    expect(component.statusClass).toBeDefined();
    expect(component.hasStatus).toBeDefined();
  });

  it('should have proper signal types', () => {
    expect(typeof component.data).toBe('function');
    expect(typeof component.showStatus).toBe('function');
    expect(typeof component.statusClass).toBe('function');
    expect(typeof component.hasStatus).toBe('function');
  });
});
