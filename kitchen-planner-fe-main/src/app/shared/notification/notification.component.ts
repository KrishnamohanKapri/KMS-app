import { Component } from '@angular/core';
import { NotificationGet200ResponseDataInner, NotificationsApi } from '../../api/api-kms-planner-masterdata';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-notification',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
notifications: any = [];
  isOpen = false;

  constructor(
    private readonly notificationApi: NotificationsApi, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationApi.notificationGet().subscribe({
      next: (response: any) => {
        // Sort latest first
        this.notifications = response.data.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err) => console.error('Error fetching notifications:', err)
    });
  }

  openNotification(notification: any): void {
    if (notification.type === 'newOrder' && notification.data?.orderId) {
      console.log(notification.data?.orderId);
      this.router.navigateByUrl(`/admin/orders/${notification.data.orderId}`);
    } else if (notification.type === 'newChef') {
      this.router.navigateByUrl('/admin/cheflist');
    }
    // Optional: mark as read locally
    notification.isRead = true;
  }

  get unreadCount(): number {
    return this.notifications.filter((n: { isRead: any; }) => !n.isRead).length;
  }

  // Helper function to display relative time
  getRelativeTime(dateString: string): string {
    const now = new Date().getTime();
    const notifTime = new Date(dateString).getTime();
    const diff = now - notifTime; // difference in milliseconds

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