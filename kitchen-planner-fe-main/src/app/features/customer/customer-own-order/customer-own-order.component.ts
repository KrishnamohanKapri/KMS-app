import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { Order, OrdersApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { DeliveryComponent } from '../../delivery/delivery.component';

@Component({
  selector: 'app-customer-own-order',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, MatPaginatorModule, MatButtonModule, NavbarComponent, MatIconModule],
  templateUrl: './customer-own-order.component.html',
  styleUrl: './customer-own-order.component.css'
})
export class CustomerOwnOrderComponent implements OnInit {
  orders: Order[] = []

  pageIndex = 0;
  pageSize = 3;
  pagedOrders: any[] = [];

  constructor(private readonly ordersApi: OrdersApi, private readonly loaderService: LoaderService,
    private readonly notificationService: NotificationService,
    private dialogService: MatDialog
  ) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loaderService.show();
    this.ordersApi.orderGet(1, 1000).subscribe({
      next: (response) => {
        this.orders = response.data || [];
        this.pagedOrders = this.orders.slice(0, this.pageSize);
        this.loaderService.hide();
      },
      error: (error) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to load orders. Please try again later.', 'error');
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    const start = this.pageIndex * this.pageSize;
    this.pagedOrders = this.orders.slice(start, start + this.pageSize);
  }

  openTrackDialog(order: Order): void {
    const { street, city, state, zipCode, country } = order.deliveryAddress!;
    const address = `${street}, ${zipCode} ${city}, ${state}, ${country}`;

    this.dialogService.open(DeliveryComponent, {
      data: {
        orderId: order._id,
        orderAddress: address
      },
      width: '700px',
      maxWidth: '1200px',
      height: '450px',  
    })
  }

  cancelOrder(order: Order) {
    if (order.status !== 'pending') {
      this.notificationService.show('Only pending orders can be cancelled.', 'error');
      return;
    }
    this.loaderService.show();

    this.ordersApi.orderUpdateStatusOrderIdPut(order._id!, { status: 'cancelled' }).subscribe({
      next: (response) => {
        this.notificationService.show('Order cancelled successfully.', 'success');
        this.fetchOrders();
        this.loaderService.hide();
      },
      error: (error) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to cancel order. Please try again later.', 'error');
      }
    });
  }
}
