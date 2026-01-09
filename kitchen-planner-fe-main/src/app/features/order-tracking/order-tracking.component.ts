import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  standalone: true,
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.css'],
  imports: [CommonModule,NavbarComponent],
})
export class OrderTrackingComponent {
  trackingUpdates = [
    { orderId: 'ORD001', status: 'Order Received', timestamp: '2025-07-05 10:00 AM' },
    { orderId: 'ORD002', status: 'In Kitchen', timestamp: '2025-07-05 10:30 AM' },
    { orderId: 'ORD003', status: 'Out for Delivery', timestamp: '2025-07-05 11:00 AM' },
    { orderId: 'ORD004', status: 'Delivered', timestamp: '2025-07-05 12:00 PM' },
  ];
}
