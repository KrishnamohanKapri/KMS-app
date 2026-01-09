import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsDashboardComponent } from './meals-dashboard.component';

describe('MealsDashboardComponent', () => {
  let component: MealsDashboardComponent;
  let fixture: ComponentFixture<MealsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
