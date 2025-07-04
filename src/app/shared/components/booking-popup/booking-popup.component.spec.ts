import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingPopupComponent } from './booking-popup.component';
import { TranslateModule } from '@ngx-translate/core';

describe('BookingPopupComponent', () => {
  let component: BookingPopupComponent;
  let fixture: ComponentFixture<BookingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPopupComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should not show popup when open is false', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.booking-popup-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should show popup when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.booking-popup-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should display booking details correctly', () => {
    const testDetails = {
      date: '2024-01-15',
      time: '14:30',
      clientName: 'John Doe'
    };

    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('bookingDetails', testDetails);
    fixture.detectChanges();

    const dateElement = fixture.nativeElement.querySelector('.info-row .value');
    expect(dateElement.textContent).toContain('dilluns, 15 de gener del 2024');
  });

  it('should emit cancelled event when close button is clicked', () => {
    spyOn(component.cancelled, 'emit');

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.close-btn');
    closeBtn.click();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should emit confirmed event when confirm button is clicked with valid data', () => {
    spyOn(component.confirmed, 'emit');

    const testDetails = {
      date: '2024-01-15',
      time: '14:30',
      clientName: 'John Doe'
    };

    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('bookingDetails', testDetails);
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('.btn-primary');
    confirmBtn.click();

    expect(component.confirmed.emit).toHaveBeenCalledWith(testDetails);
  });

  it('should disable confirm button when client name is empty', () => {
    const testDetails = {
      date: '2024-01-15',
      time: '14:30',
      clientName: ''
    };

    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('bookingDetails', testDetails);
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('.btn-primary');
    expect(confirmBtn.disabled).toBe(true);
  });

  it('should emit clientNameChanged when input value changes', () => {
    spyOn(component.clientNameChanged, 'emit');

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#clientName');
    input.value = 'New Name';
    input.dispatchEvent(new Event('input'));

    expect(component.clientNameChanged.emit).toHaveBeenCalledWith('New Name');
  });
});
