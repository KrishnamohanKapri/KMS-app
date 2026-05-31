import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AddEditStockDialogComponent } from './add-edit-stock-dialog/add-edit-stock-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StockApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { ViewStockBatchesComponent } from './view-stock-batches/view-stock-batches.component';
import { AddNewStockBatchComponent } from './add-new-stock-batch/add-new-stock-batch.component';

export interface StockItem {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  stock: number;
  baseUnit: string;
  packagingUnit: string;
  packagingQuantity: number;
  costPerPackage: number;
  reorderLevel: number;
  isActive: boolean;
  unit: string;
  costPerUnit: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  costPerBaseUnit: number;
  totalBaseUnits: number;
  displayUnit: string;
  stockStatus: 'AVAILABLE' | 'OUT_OF_STOCK' | 'LOW_STOCK';
  needsReorder: boolean;
  expanded?: boolean; // UI only
}

@Component({
  standalone: true,
  selector: 'app-stock-management',
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.css']
})
export class StockManagementComponent implements OnInit {
  allItems: StockItem[] = [];
  filteredItems: StockItem[] = [];
  pagedItems: StockItem[] = [];

  pageIndex = 0;
  pageSize = 5;
  searchTerm = '';

  constructor(
    private stockApi: StockApi,
    private loaderService: LoaderService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadStockItems();
  }

  private loadStockItems() {
    this.loaderService.show();
    this.stockApi.stockIngredientsStockGet().subscribe({
      next: (response) => {
        this.allItems = response.data as any|| [];
        this.applyFilter();
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to load stock items', 'error');
        this.loaderService.hide();
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredItems = this.allItems.filter(item =>
      item.name.toLowerCase().includes(term)
    );
    this.pageIndex = 0;
    this.updatePagedItems();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, end);
  }

  openAddStock() {
    const dialogRef = this.dialog.open(AddEditStockDialogComponent, {
      data: { mode: 'add' },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadStockItems();
    });
  }

  openEditStock(stock: StockItem) {
    const dialogRef = this.dialog.open(AddEditStockDialogComponent, {
      data: { mode: 'add', stock },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadStockItems();
    });
  }

  addNewStockBatch(stock: StockItem) {
    // Open the AddNewStockBatchComponent dialog
    const dialogRef = this.dialog.open(
      AddNewStockBatchComponent,
      {
        data: { stock },
        width: '1200px',
        maxWidth: '1200px',
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadStockItems();
    });
  }

  viewStockBatchInfo(stockId: string) {
    const dialogRef = this.dialog.open(ViewStockBatchesComponent, {
      data: { mode: 'view', stockId },
      width: '1200px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh'
    });
  
  }

  deleteStock(id: string) {
    if (confirm('Are you sure you want to delete this stock item?')) {
      // Call API to delete stock by id (replace with actual service call)
      // For demo, simply reload data
      alert(`Deleted stock with id: ${id}`);
      this.loadStockItems;
    }
  }
}
