import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStockBatchesComponent } from './view-stock-batches.component';

describe('ViewStockBatchesComponent', () => {
  let component: ViewStockBatchesComponent;
  let fixture: ComponentFixture<ViewStockBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStockBatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStockBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
