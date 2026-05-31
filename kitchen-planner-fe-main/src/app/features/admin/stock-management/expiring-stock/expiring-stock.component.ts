import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { StockApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

export interface Ingredient {
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
}

export interface InventoryBatch {
  _id: string;
  id: string;
  ingredientId: Ingredient;
  packageQuantity: number;
  baseUnitQuantity: number;
  expiryDate: string;
  receivedDate: string;
  batchNumber: string;
  costPerPackage: number;
  totalCost: number;
  displayQuantity: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface InventoryBatchUI extends InventoryBatch {
  expanded?: boolean; 
}

@Component({
  selector: 'app-expiring-stock',
  imports: [CommonModule,MatPaginatorModule, MatButtonModule],
  templateUrl: './expiring-stock.component.html',
  styleUrl: './expiring-stock.component.css'
})
export class ExpiringStockComponent implements OnInit {
 items: InventoryBatchUI[] = [] as InventoryBatchUI[];
   // Pagination state
  pageIndex = 0;
  pageSize = 5;
  pagedItems = this.items.slice(0, this.pageSize);

  constructor(private readonly stockApi: StockApi, private readonly loaderService: LoaderService, private readonly notificationService: NotificationService) {}
  ngOnInit() {
    this.fetchExpiringStock();
  }

  private fetchExpiringStock() {
  this.loaderService.show();
  this.stockApi.stockBatchesExpiringGet().subscribe({
    next: (response) => {
      this.items = (response.data || []).map(item => ({ ...item, expanded: false })) as InventoryBatchUI[];
      this.updatePagedItems();
      this.loaderService.hide();
    },
    error: () => {
      this.notificationService.show('Failed to fetch expiring stock', 'error');
      this.loaderService.hide();
    } 
  });
}

onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
  this.updatePagedItems();
}

private updatePagedItems() {
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  this.pagedItems = this.items.slice(start, end);
}
}
