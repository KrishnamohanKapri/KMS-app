import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockApi } from '../../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';

export interface Category {
  count: number;
  outOfStock: number;
  lowStock: number;
  available: number;
}

export interface Categories {
  vegetable: Category;
  fruit: Category;
  meat: Category;
  dairy: Category;
  grain: Category;
  spice: Category;
  herb: Category;
  other: Category;
}

export interface Inventory {
  totalIngredients: number;
  outOfStock: number;
  lowStock: number;
  available: number;
  totalValue: number;
  categories: Categories;
}


@Component({
  standalone: true,
  selector: 'app-stock-report',
  imports: [CommonModule],
  templateUrl: './stock-report.component.html',
  styleUrl: './stock-report.component.css'
})
export class StockReportComponent implements OnInit {

    stockReport:Inventory = {} as Inventory ;

  constructor(private readonly stockApi: StockApi, private readonly loaderService: LoaderService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.getStockReport();
  }

  private getStockReport() {
    this.loaderService.show();
    this.stockApi.stockStockReportGet().subscribe({
      next: (response) => {
        this.stockReport = response.data as Inventory;  
        this.loaderService.hide();
      }
      , error: (error) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to fetch stock report', 'error');
      }
    });
  }
}
