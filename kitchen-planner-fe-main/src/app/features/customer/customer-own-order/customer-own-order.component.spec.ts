import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOwnOrderComponent } from './customer-own-order.component';

describe('CustomerOwnOrderComponent', () => {
  let component: CustomerOwnOrderComponent;
  let fixture: ComponentFixture<CustomerOwnOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerOwnOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerOwnOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
