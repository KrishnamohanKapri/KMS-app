import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutOfStockComponent } from './out-of-stock.component';

describe('OutOfStockComponent', () => {
  let component: OutOfStockComponent;
  let fixture: ComponentFixture<OutOfStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutOfStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutOfStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
