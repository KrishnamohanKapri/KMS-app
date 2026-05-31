import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKitchenRulesComponent } from './add-kitchen-rules.component';

describe('AddKitchenRulesComponent', () => {
  let component: AddKitchenRulesComponent;
  let fixture: ComponentFixture<AddKitchenRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKitchenRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKitchenRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
