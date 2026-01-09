import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StockApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  selector: 'app-add-new-stock-batch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-new-stock-batch.component.html',
  styleUrls: ['./add-new-stock-batch.component.css']
})
export class AddNewStockBatchComponent {
  batchForm: FormGroup;
  loading = false;
  ingredient: any;

  constructor(
    private fb: FormBuilder,
    private stockApi: StockApi,
    private loaderService: LoaderService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<AddNewStockBatchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.ingredient = data?.stock;
    this.batchForm = this.fb.group({
      packageQuantity: [null, [Validators.required, Validators.min(1)]],
      baseUnitQuantity: [null, [Validators.required, Validators.min(1)]],
      expiryDate: [null, Validators.required],
      receivedDate: [new Date()],
      batchNumber: [''],
      costPerPackage: [null, [Validators.required, Validators.min(0)]],
      supplier: [''],
      purchaseOrder: ['']
    });
  }

  submit() {
    if (this.batchForm.invalid) return;
    this.loading = true;
    this.loaderService.show();
    const form = this.batchForm.value;
    const batchCreate = {
      quantity: form.baseUnitQuantity,
      expiryDate: form.expiryDate,
      cost: form.costPerPackage,
      supplier: form.supplier,
      packageQuantity: form.packageQuantity,
      batchNumber: form.batchNumber,
      receivedDate: form.receivedDate,
      purchaseOrder: form.purchaseOrder,
      baseUnitQuantity: form.baseUnitQuantity,
      costPerPackage: form.costPerPackage
    };
    this.stockApi.stockIngredientsIngredientIdBatchesPost(this.ingredient.id, batchCreate).subscribe({
      next: (_res: any) => {
        this.notificationService.show('Batch added successfully!', 'success');
        this.dialogRef.close('saved');
        this.loaderService.hide();
        this.loading = false;
      },
      error: (err: any) => {
        this.notificationService.show(err?.error?.message || 'Failed to add batch', 'error');
        this.loaderService.hide();
        this.loading = false;
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
