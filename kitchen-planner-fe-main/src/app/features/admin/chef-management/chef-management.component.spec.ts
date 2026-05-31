import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefManagementComponent } from './chef-management.component';

describe('ChefManagementComponent', () => {
  let component: ChefManagementComponent;
  let fixture: ComponentFixture<ChefManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
