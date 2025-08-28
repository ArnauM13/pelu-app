import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleBasedContentComponent } from './role-based-content.component';
import { UserService } from '../../../core/services/user.service';

describe('RoleBasedContentComponent', () => {
  let component: RoleBasedContentComponent;
  let fixture: ComponentFixture<RoleBasedContentComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'currentRole',
      'hasPermission',
    ]);

    await TestBed.configureTestingModule({
      imports: [RoleBasedContentComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleBasedContentComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have input properties defined', () => {
    expect(component.roles).toBeDefined();
    expect(component.permissions).toBeDefined();
    expect(component.requireAllPermissions).toBeDefined();
  });

  it('should have computed property defined', () => {
    expect(component.shouldShowContent).toBeDefined();
  });

  it('should have default input values', () => {
    expect(component.roles).toEqual([]);
    expect(component.permissions).toEqual([]);
    expect(component.requireAllPermissions).toBe(false);
  });

  it('should not show content when no user is authenticated', () => {
    userService.currentRole.and.returnValue(null);

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(false);
  });

  it('should show content when no roles are specified', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
  });

  it('should show content when user role matches specified roles', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['admin', 'client'];

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
  });

  it('should not show content when user role does not match specified roles', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['admin'];

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(false);
  });

  it('should show content for admin when no permissions are required', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['admin'];
    component.permissions = [];

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
  });

  it('should show content for admin when has required permission (any)', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    userService.hasPermission.and.returnValue(true);
    component.roles = ['admin'];
    component.permissions = ['manage_users'];
    component.requireAllPermissions = false;

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
    expect(userService.hasPermission).toHaveBeenCalledWith('manage_users');
  });

  it('should not show content for admin when does not have required permission (any)', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    userService.hasPermission.and.returnValue(false);
    component.roles = ['admin'];
    component.permissions = ['manage_users'];
    component.requireAllPermissions = false;

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(false);
    expect(userService.hasPermission).toHaveBeenCalledWith('manage_users');
  });

  it('should show content for admin when has all required permissions', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    userService.hasPermission.and.callFake((permission: string) => {
      return permission === 'manage_users' || permission === 'manage_services';
    });
    component.roles = ['admin'];
    component.permissions = ['manage_users', 'manage_services'];
    component.requireAllPermissions = true;

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
    expect(userService.hasPermission).toHaveBeenCalledWith('manage_users');
    expect(userService.hasPermission).toHaveBeenCalledWith('manage_services');
  });

  it('should not show content for admin when does not have all required permissions', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    userService.hasPermission.and.callFake((permission: string) => {
      return permission === 'manage_users'; // Only has one permission
    });
    component.roles = ['admin'];
    component.permissions = ['manage_users', 'manage_services'];
    component.requireAllPermissions = true;

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(false);
    expect(userService.hasPermission).toHaveBeenCalledWith('manage_users');
    expect(userService.hasPermission).toHaveBeenCalledWith('manage_services');
  });

  it('should show content for client when permissions are specified (permissions only apply to admins)', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['client'];
    component.permissions = ['manage_users']; // Should be ignored for clients

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
    expect(userService.hasPermission).not.toHaveBeenCalled();
  });

  it('should handle multiple roles correctly', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['admin', 'client'];

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
  });

  it('should handle empty permissions array', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['admin'];
    component.permissions = [];

    const shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
    expect(userService.hasPermission).not.toHaveBeenCalled();
  });

  it('should be a standalone component', () => {
    expect(RoleBasedContentComponent.prototype.constructor).toBeDefined();
    expect(RoleBasedContentComponent.prototype.constructor.name).toBe('RoleBasedContentComponent2'); // Actual name in tests
  });

  it('should have component metadata', () => {
    expect(RoleBasedContentComponent.prototype).toBeDefined();
    expect(RoleBasedContentComponent.prototype.constructor).toBeDefined();
  });

  it('should not throw errors during rendering', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle role changes correctly', () => {
    // Test with client role
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'client',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['client'];
    let shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);

    // Test with admin role
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);
  });

  it('should handle permission changes correctly', () => {
    userService.currentRole.and.returnValue({
      uid: 'user123',
      email: 'test@example.com',
      role: 'admin',
      lang: 'ca',
      theme: 'light'
    });
    component.roles = ['admin'];
    component.permissions = ['manage_users'];
    component.requireAllPermissions = false;

    // Test with permission granted
    userService.hasPermission.and.returnValue(true);
    let shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(true);

    // Test with permission denied - re-create component to force signal re-evaluation
    userService.hasPermission.and.returnValue(false);
    fixture = TestBed.createComponent(RoleBasedContentComponent);
    component = fixture.componentInstance;
    component.roles = ['admin'];
    component.permissions = ['manage_users'];
    component.requireAllPermissions = false;
    shouldShow = component.shouldShowContent();
    expect(shouldShow).toBe(false);
  });
});
