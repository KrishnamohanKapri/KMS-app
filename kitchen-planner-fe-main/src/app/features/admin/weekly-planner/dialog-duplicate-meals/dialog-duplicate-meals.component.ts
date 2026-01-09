import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, Injector } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-dialog-duplicate-meals',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    CommonModule,
    NgIf,
   
  ],
  providers: [{provide: DateAdapter, useClass: NativeDateAdapter}, {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS},],
  templateUrl: './dialog-duplicate-meals.component.html',
  styleUrl: './dialog-duplicate-meals.component.css'
})
export class DialogDuplicateMealsComponent {
duplicateForm!: FormGroup;
  minDate!: Date;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogDuplicateMealsComponent>,
    @Inject(MAT_DIALOG_DATA) public planData: any, // existing plan
  ) {}

  ngOnInit(): void {
    console.log('Plan Data:', this.planData);
    this.minDate = new Date(this.planData.plan.date || this.planData.plan.startDate);

    this.duplicateForm = this.fb.group({
      type: [this.planData.plan.type, Validators.required],
      date: [this.planData.plan.type === 'day' ? null : null, Validators.required],
      startDate: [this.planData.plan.type === 'week' ? null : null],
      endDate: [this.planData.plan.type === 'week' ? null : null],
    });

    if (this.planData.plan.type === 'day') {
      this.duplicateForm.get('date')?.setValidators([Validators.required]);
    } else {
      this.duplicateForm.get('startDate')?.setValidators([Validators.required]);
      this.duplicateForm.get('endDate')?.setValidators([Validators.required]);
    }
  }
 submit() {
    if (this.duplicateForm.invalid) return;

    const value = this.duplicateForm.value;

    const payload: any = {
      mealsPlanId: this.planData._id,
    };

    if (value.type === 'day') {
      payload.newDate = value.date;
    } else {
      payload.newStartDate = value.startDate;
      payload.newEndDate = value.endDate;
    }

    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }
  // submit() {
  //   if (this.duplicateForm.invalid) return;

  //   const value = this.duplicateForm.value;

  //   const duplicatedPayload = {
  //     type: value.type,
  //     date: value.type === 'day' ? value.date : null,
  //     startDate: value.type === 'week' ? value.startDate : null,
  //     endDate: value.type === 'week' ? value.endDate : null,
  //     meals: this.planData.meals.map((m: any) => ({
  //       mealId: m.mealId._id || m.mealId,
  //       servings: m.servings
  //     })),
  //     assignedStaff: this.planData.assignedStaff.map((s: any) => s._id),
  //     notes: this.planData.notes,
  //     createdBy: this.planData.createdBy._id
  //   };

  //   this.dialogRef.close(duplicatedPayload);
  // }

 

}
