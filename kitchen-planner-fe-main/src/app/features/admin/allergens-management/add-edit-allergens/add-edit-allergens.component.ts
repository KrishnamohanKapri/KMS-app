import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { EntitiesApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  selector: 'app-add-edit-allergens',
   standalone: true,
  imports: [MatDialogModule, MatButtonModule, NgIf,  ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './add-edit-allergens.component.html',
  styleUrl: './add-edit-allergens.component.css'
})
export class AddEditAllergensComponent {
allergenForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditAllergensComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; allergen?: any },
    private entitiesApi: EntitiesApi,
        private loaderService: LoaderService,
        private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.allergenForm = this.fb.group({
      name: [this.data.allergen?.name || '', Validators.required],
      description: [this.data.allergen?.description, [Validators.required]],
      severity: [this.data.allergen?.severity || '', Validators.required],
      isActive: [true],
    });
  }

  // ✅ Getters for cleaner HTML
  get nameCtrl() { return this.allergenForm.get('name'); }
  get descriptionCtrl() { return this.allergenForm.get('description'); }
  get severityCtrl() { return this.allergenForm.get('severity'); }

onSubmit() {
    if (this.allergenForm.invalid) return;
    this.loaderService.show();
    const allergenData = {
      name: this.nameCtrl?.value,
      description: this.descriptionCtrl?.value,
      severity: this.severityCtrl?.value,
      isActive: true
    };
    if (this.data.mode === 'edit') {
      this.entitiesApi.entitiesAllergensAllergenIdPut(this.data.allergen._id, allergenData).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Tag updated successfully!');
          this.dialogRef.close('saved');
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to update tag: ' + error.message);
        }
      }); 
    } else {
      this.entitiesApi.entitiesAllergensPost(allergenData).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Tag added successfully!');
          this.dialogRef.close('saved');
        },
        error: (error) => {
          this.loaderService.hide();
          this.notificationService.show('Failed to add tag: ' + error.error.message);
        }
      });
    this.dialogRef.close('saved');
  }
  }
}
