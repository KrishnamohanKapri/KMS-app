import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgIf } from '@angular/common';
import { PaymentsApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from "@angular/material/icon";
@Component({
  selector: 'app-customer-detail-dialog',
  imports: [MatDialogModule, MatButtonModule, NgIf, CommonModule, MatTableModule, MatIconModule],
  templateUrl: './customer-detail-dialog.component.html',
  styleUrl: './customer-detail-dialog.component.css'
})
export class CustomerDetailDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private readonly paymentApi: PaymentsApi, private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.getPaymentDetailsForCustomer();
    
  }

  getPaymentDetailsForCustomer() {
    this.loaderService.show();
    this.paymentApi.paymentCustomerCustomerIdGet(this.data._id).subscribe({
      next: (response:any) => {
        this.data.payments = response.data.payments;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error fetching payment details:', error);
        this.loaderService.hide();
      }
    });
  }

}
