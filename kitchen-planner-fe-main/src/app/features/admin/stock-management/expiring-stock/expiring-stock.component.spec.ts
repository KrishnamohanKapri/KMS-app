import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiringStockComponent } from './expiring-stock.component';

describe('ExpiringStockComponent', () => {
  let component: ExpiringStockComponent;
  let fixture: ComponentFixture<ExpiringStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiringStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiringStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
