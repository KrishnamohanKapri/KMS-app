import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../shared/loader/loader.service';
import { NotificationService } from '../../shared/notification.service';
import { Order, OrdersApi } from '../../api/api-kms-planner-masterdata';
import { UserService } from '../../shared/user.service';

@Component({
  standalone: true,
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class OrdersListComponent implements OnInit {
  searchTerm = '';
  currentPage = 1;
  pageSize = 15;

  orders: any[] = [];

  constructor(private router: Router, private loaderService: LoaderService, private readonly notificationService: NotificationService,
    private readonly orderApi: OrdersApi, private readonly userService: UserService,
  ) { }

  ngOnInit() {
    this.fetchOrders();
  }

  get filteredOrders() {
    const filtered = this.orders.filter(order =>
      order.billingInfo?.firstName!.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      order.billingInfo?.lastName!.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      order.status!.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
    const filtered = this.orders.filter(order =>
      order.billingInfo?.firstName!.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      order.billingInfo?.lastName!.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      order.status!.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return Math.ceil(filtered.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  viewDetails(orderId: string) {
    if (this.userService.getUserInfo()?.role === 'admin') {
      this.router.navigate([`/admin/orders/${orderId}`]);
    } else if (this.userService.getUserInfo()?.role === 'rider') {
      this.router.navigate([`/rider/orders/${orderId}`]);
    } else if (this.userService.getUserInfo()?.role === 'employee') {
      this.router.navigate([`/employee/orders/${orderId}`]);
    } else if (this.userService.getUserInfo()?.role === 'chef') {
      this.router.navigate([`/chef/orders/${orderId}`]);
    }

  }

  private fetchOrders() {
    this.loaderService.show();
    this.orderApi.orderGet(1, 1000).subscribe({
      next: (response) => {
        let orders = response.data || [];

        const role = this.userService.getUserInfo()?.role;

        if (role === 'chef') {
          // Chef: only confirmed + preparing
          orders = orders.filter(
            (order: any) =>
              order.status === 'confirmed' || order.status === 'preparing'
          );
        } else if (role === 'rider') {
          // Rider: only ready + in-delivery
          orders = orders.filter(
            (order: any) =>
              order.status === 'ready' || order.status === 'in-delivery'
          );
        }
        // Admin & Employee: no filter, can see all orders

        this.orders = orders;
        this.loaderService.hide();
      },
      error: (error) => {
        this.notificationService.show('Failed to load orders', 'error');
        this.loaderService.hide();
      }
    });
  }
}
