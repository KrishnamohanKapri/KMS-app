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

export interface IngredientUI extends Ingredient {
  expanded?: boolean; // UI state for expandable rows
}

@Component({
  selector: 'app-out-of-stock',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, MatButtonModule],
  templateUrl: './out-of-stock.component.html',
  styleUrls: ['./out-of-stock.component.css']
})
export class OutOfStockComponent implements OnInit {
  lowStockItems: IngredientUI[] = [];
  pagedItems: IngredientUI[] = [];
  pageIndex = 0;
  pageSize = 5;

  constructor(
    private readonly stockApi: StockApi,
    private readonly loaderService: LoaderService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadLowStockItems();
  }

  private loadLowStockItems() {
    this.loaderService.show();
    this.stockApi.stockIngredientsOutOfStockGet().subscribe({
      next: (response) => {
        this.lowStockItems = (response.data || [] as any).map((item:any) => ({
          ...item,
          expanded: false
        }));
        this.pageIndex = 0; // reset pageIndex
        this.updatePagedItems();
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to load low stock items', 'error');
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
    this.pagedItems = this.lowStockItems.slice(start, end);
  }
}
