import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StockApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  selector: 'app-add-edit-stock-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, NgIf,  ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './add-edit-stock-dialog.component.html',
  styleUrls: ['./add-edit-stock-dialog.component.css']
})
export class AddEditStockDialogComponent implements OnInit {
  stockForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; stock?: any },
    private loaderService: LoaderService,
    private notificationService: NotificationService,
    private stockApi: StockApi,
  ) {}

  ngOnInit() {
    this.stockForm = this.fb.group({
      quantity: [this.data.stock?.quantity || 0, [Validators.required, Validators.min(0)]],
    });
  }

  // ✅ Getters for cleaner HTML
  get quantityCtrl() { return this.stockForm.get('quantity'); }

  onSubmit() {
    if (this.stockForm.invalid) return;
    this.loaderService.show();
    this.stockApi.stockIngredientsIngredientIdAddStockPost(this.data.stock?._id, {
      quantity: this.quantityCtrl?.value,
    }).subscribe({
      next: (response: any) => {
        this.loaderService.hide();
        if (response.success) {
          this.notificationService.show('Stock updated successfully');
          this.dialogRef.close('saved');
        } else {
          this.notificationService.show(response.message || 'Failed to add stock', 'error');
        }
      },
      error: (error) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to add stock: ' + error.message);
      }
    });

    this.dialogRef.close('saved');
  }
}
