import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../../shared/user.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  selector: 'app-update-order-status-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './update-order-status-dialog.component.html',
  styleUrl: './update-order-status-dialog.component.css'
})
export class UpdateOrderStatusDialogComponent {
  statusOptions: string[] = [];
  selectedStatus: string;

  // Define allowed transitions
  private statusFlow: Record<string, string[]> = {
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['in-delivery', 'cancelled'],
    'in-delivery': ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };

  constructor(
    public dialogRef: MatDialogRef<UpdateOrderStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStatus: string },
    private readonly userService: UserService,
    private readonly notificationService: NotificationService
  ) {
    this.selectedStatus = data.currentStatus;

    // Role-based filter
    if (this.userService.getUserInfo()?.role === 'admin') {
      this.statusOptions = ['preparing', 'ready', 'in-delivery', 'delivered', 'cancelled'];
    } else if (this.userService.getUserInfo()?.role === 'chef' || this.userService.getUserInfo()?.role === 'employee') {
      this.statusOptions = ['preparing', 'ready', 'cancelled'];
    } else if (this.userService.getUserInfo()?.role === 'rider') {
      this.statusOptions = ['in-delivery', 'delivered', 'cancelled'];
    }

    // Only allow valid next statuses based on current status
    this.statusOptions = this.statusOptions.filter(option =>
      this.statusFlow[data.currentStatus]?.includes(option)
    );
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    const allowedNext = this.statusFlow[this.data.currentStatus] || [];

    if (!allowedNext.includes(this.selectedStatus)) {
      this.notificationService.show(
        `Invalid status change: You cannot move from "${this.data.currentStatus}" to "${this.selectedStatus}".`,'error'
      );
      return;
    }

    this.dialogRef.close(this.selectedStatus);
  }
}
