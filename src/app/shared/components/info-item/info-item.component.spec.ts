import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoItemComponent, InfoItemData } from './info-item.component';

describe('InfoItemComponent', () => {
  let component: InfoItemComponent;
  let fixture: ComponentFixture<InfoItemComponent>;

  const mockInfoItemData: InfoItemData = {
    icon: 'pi-user',
    label: 'Usuari',
    value: 'John Doe',
    status: 'active',
    statusText: 'Actiu'
  };

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

  it('should accept info item data', () => {
    component.data = mockInfoItemData;
    fixture.detectChanges();

    expect(component.data).toEqual(mockInfoItemData);
  });

  it('should have default showStatus as false', () => {
    expect(component.showStatus).toBe(false);
  });

  it('should accept showStatus input', () => {
    component.showStatus = true;
    expect(component.showStatus).toBe(true);
  });

  it('should return empty string for status class when showStatus is false', () => {
    component.data = mockInfoItemData;
    component.showStatus = false;

    expect(component.getStatusClass()).toBe('');
  });

  it('should return status class when showStatus is true and status exists', () => {
    component.data = mockInfoItemData;
    component.showStatus = true;

    expect(component.getStatusClass()).toBe('status-active');
  });

  it('should return empty string when showStatus is true but no status', () => {
    component.data = { ...mockInfoItemData, status: undefined };
    component.showStatus = true;

    expect(component.getStatusClass()).toBe('');
  });

  it('should handle different status types', () => {
    component.showStatus = true;

    component.data = { ...mockInfoItemData, status: 'inactive' };
    expect(component.getStatusClass()).toBe('status-inactive');

    component.data = { ...mockInfoItemData, status: 'warning' };
    expect(component.getStatusClass()).toBe('status-warning');

    component.data = { ...mockInfoItemData, status: 'error' };
    expect(component.getStatusClass()).toBe('status-error');
  });

  it('should render info item with data', () => {
    component.data = mockInfoItemData;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Usuari');
    expect(compiled.textContent).toContain('Actiu');
  });

  it('should render icon text when provided', () => {
    component.data = mockInfoItemData;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('pi-user');
  });

  it('should render status when showStatus is true', () => {
    component.data = mockInfoItemData;
    component.showStatus = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Actiu');
  });
});
