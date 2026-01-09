import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenRulesComponent } from './kitchen-rules.component';

describe('KitchenRulesComponent', () => {
  let component: KitchenRulesComponent;
  let fixture: ComponentFixture<KitchenRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
