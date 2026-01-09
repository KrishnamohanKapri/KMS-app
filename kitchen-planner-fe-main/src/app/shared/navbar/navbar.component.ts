import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { CartService } from '../cart.service';
import { NotificationsApi } from '../../api/api-kms-planner-masterdata';
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatDivider
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: any = null;
  role: string = '';
  firstName: string = '';
  totalItems: number = 0;
  notifications: any[] = [];

  constructor(private readonly userService: UserService, private cartService: CartService,
    private readonly notificationApi: NotificationsApi, private router: Router) { }

  ngOnInit(): void {
    if (this.userService.getUserInfo()) {
      this.user = this.userService.getUserInfo();
      this.role = this.user.role;
      this.firstName = this.user.firstName || '';
      this.totalCartItems();
      if (this.role === 'user') {
        setInterval(() => {
          this.totalCartItems();
        }, 1000);
      }
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    this.notificationApi.notificationGet().subscribe({
      next: (response: any) => {
        this.notifications = response.data;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  logout() {
    this.userService.logout();
  }

  private totalCartItems() {
    this.totalItems = this.cartService.getTotalItems();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  get topNotifications(): any[] {
    // Sort by latest createdAt first
    return this.notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  navigateToAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  openNotification(notification: any): void {
    if (notification.type === 'newOrder' && notification.data?.orderId) {
      console.log(notification.data?.orderId);
      this.router.navigateByUrl(`/admin/orders/${notification.data.orderId}`);
    } else if (notification.type === 'newChef') {
      this.router.navigateByUrl('/admin/cheflist');
    }
  }

  getRelativeTime(dateString: string): string {
    const now = new Date().getTime();
    const notifTime = new Date(dateString).getTime();
    const diff = now - notifTime;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
