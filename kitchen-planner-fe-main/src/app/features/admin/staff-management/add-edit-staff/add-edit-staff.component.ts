import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthenticationApi } from '../../../../api/api-kms-planner-masterdata';
import { NotificationService } from '../../../../shared/notification.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoaderService } from '../../../../shared/loader/loader.service';

@Component({
  selector: 'app-add-edit-staff-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './add-edit-staff.component.html',
  styleUrls: ['./add-edit-staff.component.css']
})
export class AddEditStaffComponent implements OnInit {
 staffForm!: FormGroup;
  isSaving = false;
  mode: 'add' | 'edit' = 'add';
  roles = [
  { value: 'chef', label: 'Chef' },
  { value: 'employee', label: 'Employee' },
  { value: 'rider', label: 'Rider' }
];

  constructor(
    private fb: FormBuilder,
    private staffApi: AuthenticationApi,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private dialogRef: MatDialogRef<AddEditStaffComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; staff?: any },
  ) {}

  ngOnInit() {
    this.mode = this.data.mode;
    this.staffForm = this.fb.group({
      firstName: [this.data.staff?.firstName, Validators.required],
      lastName: [this.data.staff?.lastName, Validators.required],
      email: [this.data.staff?.email, [Validators.required, Validators.email]],
      role: [this.data.staff?.role, Validators.required], 
      isActive: [this.data.staff?.isActive ?? true],
      password: ['']
    });

    if (this.mode === 'edit') {
      this.staffForm.get('password')?.disable();
    }
  }
  
  onSubmit() {
    if (this.staffForm.invalid) return;
    this.loaderService.show();
    this.isSaving = true;
    const payload = this.staffForm.getRawValue();

    if (this.mode === 'add') {
      this.staffApi.authStaffPost(payload).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Staff created successfully', 'success');
          this.dialogRef.close('saved');
        },
        error: () => {
          this.loaderService.hide();
          this.notificationService.show('Failed to create staff', 'error');
          this.isSaving = false;
        }
      });
    } else {
      this.staffApi.authStaffIdPut(this.data.staff._id!, payload).subscribe({
        next: () => {
          this.loaderService.hide();
          this.notificationService.show('Staff updated successfully', 'success');
           this.dialogRef.close('saved');
        },
        error: () => {
          this.loaderService.hide();
          this.notificationService.show('Failed to update staff', 'error');
          this.isSaving = false;
        }
      });
    }
  }
}
