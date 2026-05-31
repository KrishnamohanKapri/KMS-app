import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { StockApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-view-stock-batches',
  imports: [CurrencyPipe, MatPaginatorModule,CommonModule,MatTableModule],
  templateUrl: './view-stock-batches.component.html',
  styleUrl: './view-stock-batches.component.css'
})
export class ViewStockBatchesComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<ViewStockBatchesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; stockId: string },
  private stockApi: StockApi,
  private loaderService: LoaderService,
  private notificationService: NotificationService) {}
  

  displayedColumns: string[] = [
    'batchNumber',
    'packageQuantity',
    'baseUnitQuantity',
    'displayQuantity',
    'costPerPackage',
    'totalCost',
    'receivedDate',
    'expiryDate'
  ];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadStockBatches();
  }

  loadStockBatches() {
    this.loaderService.show();
    this.stockApi.stockIngredientsIngredientIdBatchesGet(this.data.stockId).subscribe({
      next: (response) => {
        this.dataSource.data = response.data || []; 
        this.dataSource.paginator = this.paginator;
        this.loaderService.hide();
      },
      error: () => {
        this.loaderService.hide();  
        this.notificationService.show('Failed to load stock batches','error');
      }
    });
  }
}
