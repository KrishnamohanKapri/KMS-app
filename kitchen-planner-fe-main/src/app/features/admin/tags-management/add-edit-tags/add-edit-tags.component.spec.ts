import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTagsComponent } from './add-edit-tags.component';

describe('AddEditTagsComponent', () => {
  let component: AddEditTagsComponent;
  let fixture: ComponentFixture<AddEditTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
