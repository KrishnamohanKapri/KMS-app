import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSnackbarComponent } from './customer-snackbar.component';

describe('CustomerSnackbarComponent', () => {
  let component: CustomerSnackbarComponent;
  let fixture: ComponentFixture<CustomerSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
