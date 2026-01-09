import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {  AuthenticationApi} from '../../../api/api-kms-planner-masterdata'; 
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { AddEditStaffComponent } from './add-edit-staff/add-edit-staff.component';

export interface StaffItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  status: string;
  kitchenNo: string;
}

@Component({
  standalone: true,
  selector: 'app-staff-management',
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.css']
})
export class StaffManagementComponent implements OnInit {
  allStaff: StaffItem[] = [];
  filteredStaff: StaffItem[] = [];
  pagedStaff: StaffItem[] = [];

  pageIndex = 0;
  pageSize = 5;
  searchTerm = '';

  constructor(
    private staffApi: AuthenticationApi,
    private loaderService: LoaderService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadStaff();
  }

  private loadStaff() {
    this.loaderService.show();
    this.staffApi.authStaffGet().subscribe({
      next: (response: any) => {
        this.allStaff = response.data.staff || [];
        this.applyFilter();
        this.loaderService.hide();
      },
      error: () => {
        this.notificationService.show('Failed to load staff', 'error');
        this.loaderService.hide();
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredStaff = this.allStaff.filter(staff =>
      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term)
    );
    this.pageIndex = 0;
    this.updatePagedStaff();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedStaff();
  }

  private updatePagedStaff() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedStaff = this.filteredStaff.slice(start, end);
  }

  openAddStaff() {
    const dialogRef = this.dialog.open(AddEditStaffComponent, {
      data: { mode: 'add' },
      width: '1500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadStaff();
    });
  }

  openEditStaff(staff: StaffItem) {
    const dialogRef = this.dialog.open(AddEditStaffComponent, {
      data: { mode: 'edit', staff },
      width: '1500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.loadStaff();
    });
  }

  deleteStaff(id: string) {
    if (confirm('Are you sure you want to delete this staff member?')) {
    this.loaderService.show();
      this.staffApi.authStaffIdDelete(id).subscribe({
        next: () => {
          this.notificationService.show('Staff deleted successfully', 'success');
          this.loadStaff();
        },
        error: () => {
          this.loaderService.hide();
          this.notificationService.show('Failed to delete staff', 'error');
        }
      });
    }
  }
}
