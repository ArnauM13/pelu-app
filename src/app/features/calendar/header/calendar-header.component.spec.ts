import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarHeaderComponent } from './calendar-header.component';
import { By } from '@angular/platform-browser';

describe('CalendarHeaderComponent', () => {
  let component: CalendarHeaderComponent;
  let fixture: ComponentFixture<CalendarHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHeaderComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(CalendarHeaderComponent);
    component = fixture.componentInstance;
    component.mainTitle = 'Setmana del 01/01';
    component.viewDateInfo = '01/01 - 07/01';
    component.businessDaysInfo = 'Dilluns a Divendres';
    fixture.detectChanges();
  });

  it('hauria de mostrar la informació de la capçalera', () => {
    const title = fixture.nativeElement.querySelector('.title-main');
    expect(title.textContent).toContain('Setmana del 01/01');
    const info = fixture.nativeElement.querySelector('.title-info');
    expect(info.textContent).toContain('01/01 - 07/01');
    const config = fixture.nativeElement.querySelector('.title-config');
    expect(config.textContent).toContain('Dilluns a Divendres');
  });

  it('hauria d’emetre today quan es clica el botó Avui', () => {
    spyOn(component.today, 'emit');
    const btn = fixture.debugElement.query(By.css('.today-btn'));
    btn.nativeElement.click();
    expect(component.today.emit).toHaveBeenCalled();
  });

  it('hauria d’emetre previousWeek quan es clica el botó esquerra', () => {
    spyOn(component.previousWeek, 'emit');
    const btn = fixture.debugElement.query(By.css('.nav-btn'));
    btn.nativeElement.click();
    expect(component.previousWeek.emit).toHaveBeenCalled();
  });

  it('hauria d’emetre nextWeek quan es clica el botó dreta', () => {
    spyOn(component.nextWeek, 'emit');
    const btns = fixture.debugElement.queryAll(By.css('.nav-btn'));
    btns[2].nativeElement.click();
    expect(component.nextWeek.emit).toHaveBeenCalled();
  });
});
