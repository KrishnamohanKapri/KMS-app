import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from "@angular/material/input";
import { EntitiesApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-edit-tags',
  imports: [MatInputModule, ReactiveFormsModule, NgIf, MatButtonModule,MatDialogModule],
  templateUrl: './add-edit-tags.component.html',
  styleUrl: './add-edit-tags.component.css'
})
export class AddEditTagsComponent {
tagForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditTagsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; tag?: any },
    private entitiesApi: EntitiesApi,
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.tagForm = this.fb.group({
      name: [this.data.tag?.name || '', Validators.required],
      description: [this.data.tag?.description || '', [Validators.required]],
      color: [this.data.tag?.color || '', Validators.required],
      isActive: [true],
    });
  }

  // ✅ Getters for cleaner HTML
  get nameCtrl() { return this.tagForm.get('name'); }
  get descriptionCtrl() { return this.tagForm.get('description'); }
  get colorCtrl() { return this.tagForm.get('color'); }

  onSubmit() {
    if (this.tagForm.invalid) return;
    this.loaderService.show();
    const tagData = {
      name: this.nameCtrl?.value,
      description: this.descriptionCtrl?.value,
      color: this.colorCtrl?.value,
      isActive: true
    };
    if (this.data.mode === 'edit') {
      this.entitiesApi.entitiesTagsTagIdPut(this.data.tag._id, tagData).subscribe({
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
      this.entitiesApi.entitiesTagsPost(tagData).subscribe({
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
