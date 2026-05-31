import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeWorkflowsComponent } from './recipe-workflows.component';

describe('RecipeWorkflowsComponent', () => {
  let component: RecipeWorkflowsComponent;
  let fixture: ComponentFixture<RecipeWorkflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeWorkflowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeWorkflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
