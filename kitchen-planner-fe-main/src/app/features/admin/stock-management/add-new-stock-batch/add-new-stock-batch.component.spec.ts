import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewStockBatchComponent } from './add-new-stock-batch.component';

describe('AddNewStockBatchComponent', () => {
  let component: AddNewStockBatchComponent;
  let fixture: ComponentFixture<AddNewStockBatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewStockBatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewStockBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
