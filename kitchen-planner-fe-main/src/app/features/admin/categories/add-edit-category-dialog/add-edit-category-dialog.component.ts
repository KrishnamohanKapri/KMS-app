import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError } from '@angular/material/form-field';
import { MealsApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';

@Component({
  selector: 'app-add-edit-category-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, NgIf,  ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './add-edit-category-dialog.component.html',
  styleUrls: ['./add-edit-category-dialog.component.css']
})
export class AddEditCategoryDialogComponent implements OnInit {
  categoryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; category?: any },
    private readonly categoryApi: MealsApi,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: [this.data.category?.name || '', Validators.required],
    });
  }


  get nameCtrl() { return this.categoryForm.get('name'); }

  onSubmit() {
    if (this.categoryForm.invalid) return;
    this.loaderService.show();
    this.categoryApi.mealsCategoryPost({
      category: this.categoryForm.value.name,
    
    }).subscribe({
      next: (response: any) => {
        this.loaderService.hide();
        alert(`${this.data.mode === 'edit' ? 'Updated' : 'Added'} category successfully!`);
        this.dialogRef.close('saved');
      },
      error: (error: any) => {
        this.loaderService.hide();
        alert('An error occurred while saving the category. Please try again.');
      }
  });
  }
}
