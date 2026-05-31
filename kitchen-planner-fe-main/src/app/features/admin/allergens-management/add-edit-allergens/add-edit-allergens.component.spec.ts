import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAllergensComponent } from './add-edit-allergens.component';

describe('AddEditAllergensComponent', () => {
  let component: AddEditAllergensComponent;
  let fixture: ComponentFixture<AddEditAllergensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditAllergensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAllergensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
