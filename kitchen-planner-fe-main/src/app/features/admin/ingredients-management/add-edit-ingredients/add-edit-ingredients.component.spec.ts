import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditIngredientsComponent } from './add-edit-ingredients.component';

describe('AddEditIngredientsComponent', () => {
  let component: AddEditIngredientsComponent;
  let fixture: ComponentFixture<AddEditIngredientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditIngredientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditIngredientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
