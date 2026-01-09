import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStockDialogComponent } from './add-edit-stock-dialog.component';

describe('AddEditStockDialogComponent', () => {
  let component: AddEditStockDialogComponent;
  let fixture: ComponentFixture<AddEditStockDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditStockDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditStockDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
