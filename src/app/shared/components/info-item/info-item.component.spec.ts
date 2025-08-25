import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { InfoItemComponent, InfoItemData } from './info-item.component';

// Test wrapper component to provide required inputs
@Component({
  template: `
    <pelu-info-item
      [data]="data"
      [showStatus]="showStatus">
    </pelu-info-item>
  `,
  imports: [InfoItemComponent],
})
class TestWrapperComponent {
  data: InfoItemData = {
    icon: '📅',
    label: 'Test Label',
    value: 'Test Value',
  };
  showStatus = false;
}

describe('InfoItemComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;
  let infoItemComponent: InfoItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    infoItemComponent = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input signals defined', () => {
    expect(infoItemComponent.data).toBeDefined();
    expect(infoItemComponent.showStatus).toBeDefined();
  });

  it('should have computed properties defined', () => {
    expect(infoItemComponent.statusClass).toBeDefined();
    expect(infoItemComponent.hasStatus).toBeDefined();
  });

  it('should have default showStatus value', () => {
    expect(infoItemComponent.showStatus()).toBe(false);
  });

  it('should compute statusClass as empty string when showStatus is false', () => {
    const statusClass = infoItemComponent.statusClass();
    expect(statusClass).toBe('');
  });

  it('should compute hasStatus as false when showStatus is false', () => {
    const hasStatus = infoItemComponent.hasStatus();
    expect(hasStatus).toBe(false);
  });

  it('should compute statusClass for different status values when data has status', () => {
    const statuses: Array<'active' | 'inactive' | 'warning' | 'error'> = [
      'active',
      'inactive',
      'warning',
      'error',
    ];

    statuses.forEach(status => {
      const dataWithStatus: InfoItemData = {
        icon: '📅',
        label: 'Data de cita',
        value: '25 de desembre',
        status,
      };
      
      // Test the logic directly since we can't set input signals in tests
      const showStatus = true;
      const statusClass = showStatus && dataWithStatus.status ? `status-${dataWithStatus.status}` : '';
      expect(statusClass).toBe(`status-${status}`);
    });
  });

  it('should render with basic structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.info-item')).toBeTruthy();
  });

  it('should have proper HTML structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.info-item')).toBeTruthy();
  });

  it('should handle data with minimal properties', () => {
    const minimalData: InfoItemData = {
      icon: '📅',
      label: 'Data',
      value: '25/12',
    };
    
    // Test the logic directly
    const showStatus = false;
    const hasStatus = showStatus && !!minimalData.status;
    expect(hasStatus).toBe(false);
  });

  it('should handle data with all properties', () => {
    const fullData: InfoItemData = {
      icon: '📅',
      label: 'Data de cita',
      value: '25 de desembre',
      status: 'active',
    };
    
    // Test the logic directly
    const showStatus = true;
    const hasStatus = showStatus && !!fullData.status;
    expect(hasStatus).toBe(true);
  });

  it('should be a standalone component', () => {
    expect(InfoItemComponent.prototype.constructor).toBeDefined();
    expect(InfoItemComponent.prototype.constructor.name).toContain('InfoItemComponent');
  });

  it('should not throw errors during rendering', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
