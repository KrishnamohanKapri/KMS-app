import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { HistoryApi } from '../../../api/api-kms-planner-masterdata';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from "@angular/material/icon";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Activity {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  previousStatus?: string;
  userId: User;
  changedBy: User;
  notes: string;
  statusChangeDescription?: string;
  timeSinceChange: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-recent-acivity-dashboard',
  imports: [MatCardModule, MatSelectModule, CommonModule, FormsModule, MatInputModule, MatIconModule],
  templateUrl: './recent-acivity-dashboard.component.html',
  styleUrl: './recent-acivity-dashboard.component.css'
})
export class RecentAcivityDashboardComponent implements OnInit {
  activities: any[] = []; 
  filteredActivities: any[] = [];
  filters = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  selectedFilter = 'All';
  allActivities: any[] = []
  searchText: string = '';
  selectedStatus: string = 'all';
   expandedIds: Set<string> = new Set();
  constructor(private loaderService: LoaderService, private readonly notificationService: NotificationService,
    private readonly historyService: HistoryApi
  ){
  }

  ngOnInit() {
    this.fetchActivities();
  }

  fetchActivities() {
    this.loaderService.show();
    this.historyService.historyRecentActivityGet().subscribe({
      next:(response)=>{
      this.activities = response.data || [];
      this.allActivities = response.data || [];
      this.filteredActivities= this.activities;
      this.loaderService.hide();
      },
      error:(error)=>{
        this.loaderService.hide();
        this.notificationService.show(error.error.message, 'error')
      }
    })
  }


applyFilter(filter: string) {
  this.selectedFilter = filter;
  if (filter === 'All') {
    this.filteredActivities = [...this.allActivities];
  } else {
    this.filteredActivities = this.activities.filter(
      a => a.status.toLowerCase() === filter.toLowerCase()
    );
  }
}

  toggleDetails(activity: any) {
    activity.showDetails = !activity.showDetails;
  }

  getStatusColor(status: string) {
    switch(status.toLowerCase()) {
      case 'pending': return 'yellow';
      case 'preparing': return 'blue';
      case 'ready': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'grey';
    }
  }

  getStatusIcon(status: string) {
    switch(status.toLowerCase()) {
      case 'pending': return 'hourglass_empty';
      case 'preparing': return 'kitchen';
      case 'ready': return 'check_circle';
      case 'delivered': return 'local_shipping';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff} second(s) ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
    return `${Math.floor(diff / 86400)} day(s) ago`;
  }

  getStatusCount(status: string): number {
    return this.activities.filter(a => a.status.toLowerCase() === status.toLowerCase()).length;
  }

  getStatusBadgeColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'pending': return '#f0ad4e';
      case 'preparing': return '#0275d8';
      case 'ready': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }
}