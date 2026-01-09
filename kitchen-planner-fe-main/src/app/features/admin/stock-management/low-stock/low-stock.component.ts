import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { StockApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  standalone: true,
  selector: 'app-low-stock',
  imports: [CommonModule, MatPaginatorModule, MatButtonModule],
  templateUrl: './low-stock.component.html',
  styleUrls: ['./low-stock.component.css']
})
export class LowStockComponent implements OnInit {
  lowStockItems: any[] = [];
  pagedItems: any[] = [];
  pageIndex = 0;
  pageSize = 5;

  constructor(
    private readonly stockApi: StockApi,
    private readonly loaderService: LoaderService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchLowStockItems();
  }

  private fetchLowStockItems() {
    this.loaderService.show();
    this.stockApi.stockIngredientsLowStockGet().subscribe({
      next: (response) => {
        this.lowStockItems = response.data as any || [];
        this.pageIndex = 0; // reset pageIndex
        this.updatePagedItems();
        this.loaderService.hide();
      },
      error: (error) => {
        this.loaderService.hide();
        console.error('Error fetching low stock items:', error);
        this.notificationService.show('Failed to fetch low stock items. Please try again later.', 'error');
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
