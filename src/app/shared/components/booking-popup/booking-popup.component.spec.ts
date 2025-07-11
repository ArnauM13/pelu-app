import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPopupComponent } from './booking-popup.component';
import { ServicesService } from '../../../core/services/services.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;
  let mockServicesService: jasmine.SpyObj<ServicesService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockServicesService = jasmine.createSpyObj('ServicesService', ['getAllServices']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);

    mockServicesService.getAllServices.and.returnValue([]);
    mockTranslateService.instant.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [BookingPopupComponent],
      providers: [
        { provide: ServicesService, useValue: mockServicesService },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required output signals', () => {
    expect(component.confirmed).toBeDefined();
    expect(component.cancelled).toBeDefined();
  });

  it('should have computed properties', () => {
    expect(component.canConfirm).toBeDefined();
    expect(component.totalPrice).toBeDefined();
    expect(component.totalDuration).toBeDefined();
  });

  it('should have required methods', () => {
    expect(component.onClose).toBeDefined();
    expect(component.onConfirm).toBeDefined();
    expect(component.onBackdropClick).toBeDefined();
    expect(component.formatDate).toBeDefined();
    expect(component.formatPrice).toBeDefined();
    expect(component.formatDuration).toBeDefined();
  });
});
