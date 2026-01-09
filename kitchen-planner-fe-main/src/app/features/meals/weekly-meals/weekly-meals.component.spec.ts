import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyMealsComponent } from './weekly-meals.component';

describe('WeeklyMealsComponent', () => {
  let component: WeeklyMealsComponent;
  let fixture: ComponentFixture<WeeklyMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyMealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
