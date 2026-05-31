import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDuplicateMealsComponent } from './dialog-duplicate-meals.component';

describe('DialogDuplicateMealsComponent', () => {
  let component: DialogDuplicateMealsComponent;
  let fixture: ComponentFixture<DialogDuplicateMealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDuplicateMealsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDuplicateMealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
