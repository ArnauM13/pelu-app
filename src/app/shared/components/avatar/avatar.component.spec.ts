import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent, AvatarData } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size', () => {
    expect(component.size).toBe('medium');
  });

  it('should display initials when no image is provided', () => {
    component.data = { name: 'John', surname: 'Doe' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const initialsElement = compiled.querySelector('.initials');
    expect(initialsElement?.textContent?.trim()).toBe('JD');
  });

  it('should display first letter of name when only name is provided', () => {
    component.data = { name: 'John' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const initialsElement = compiled.querySelector('.initials');
    expect(initialsElement?.textContent?.trim()).toBe('J');
  });

  it('should display first letter of email when only email is provided', () => {
    component.data = { email: 'john@example.com' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const initialsElement = compiled.querySelector('.initials');
    expect(initialsElement?.textContent?.trim()).toBe('J');
  });

  it('should display question mark when no data is provided', () => {
    component.data = {};
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const initialsElement = compiled.querySelector('.initials');
    expect(initialsElement?.textContent?.trim()).toBe('?');
  });

  it('should have background image when imageUrl is provided', () => {
    component.data = { imageUrl: 'https://example.com/avatar.jpg' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const avatarElement = compiled.querySelector('.avatar') as HTMLElement;
    expect(avatarElement?.style.backgroundImage).toContain('https://example.com/avatar.jpg');
  });

  it('should not show initials when image is provided', () => {
    component.data = {
      imageUrl: 'https://example.com/avatar.jpg',
      name: 'John',
      surname: 'Doe'
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const initialsElement = compiled.querySelector('.initials');
    expect(initialsElement).toBeFalsy();
  });

  it('should have proper tooltip text', () => {
    component.data = { name: 'John', surname: 'Doe' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const avatarElement = compiled.querySelector('.avatar') as HTMLElement;
    expect(avatarElement?.getAttribute('title')).toBe('John Doe');
  });

  it('should have proper CSS classes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const avatarElement = compiled.querySelector('.avatar');
    expect(avatarElement?.classList.contains('avatar')).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(AvatarComponent.prototype.constructor.name).toBe('AvatarComponent');
  });
});
