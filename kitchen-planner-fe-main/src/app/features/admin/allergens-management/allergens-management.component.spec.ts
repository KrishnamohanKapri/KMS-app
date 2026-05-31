import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergensManagementComponent } from './allergens-management.component';

describe('AllergensManagementComponent', () => {
  let component: AllergensManagementComponent;
  let fixture: ComponentFixture<AllergensManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllergensManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllergensManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
