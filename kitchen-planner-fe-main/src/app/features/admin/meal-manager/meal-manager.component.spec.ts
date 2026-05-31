import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealManagerComponent } from './meal-manager.component';

describe('MealManagerComponent', () => {
  let component: MealManagerComponent;
  let fixture: ComponentFixture<MealManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
