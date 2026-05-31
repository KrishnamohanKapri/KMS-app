import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerDetailDialogComponent } from './customer-detail-dialog.component';
import { CustomerManagementApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  searchTerm = '';
  page = 1; // current page
  pageSize = 10; // limit per page
  totalPages = 1; // total pages from API
  totalRecords = 0;

  customers: any[] = []; // current page customers

  constructor(
    private dialog: MatDialog,
    private customerApi: CustomerManagementApi,
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  // --- Filtered customers for search within current page ---
  get filteredCustomers(): any[] {
    if (!this.searchTerm) return this.customers;
    return this.customers.filter(c =>
      `${c.user.firstName} ${c.user.lastName} ${c.user.email}`.toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }

  // --- Open customer detail dialog ---
  openCustomerDetail(customer: any): void {
    this.dialog.open(CustomerDetailDialogComponent, {
      data: customer,
      width: '1200px',
      maxWidth: 'none'
    });
  }

  // --- Pagination controls ---
  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.page = pageNumber;
    this.fetchCustomers();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.fetchCustomers();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchCustomers();
    }
  }

    // --- Fetch paginated customers from API ---
  fetchCustomers(): void {
    this.loaderService.show();
    this.customerApi.customerGet(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.customers = response.data.customers || [];
          this.totalPages = response.data.totalPages || 1;
          this.page = Number(response.data.currentPage) || 1;
          this.totalRecords = response.data.total || 0;
        }
        this.loaderService.hide();
      },
      error: (err) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to fetch customers');
        console.error('Error fetching customers:', err);
      }
    });
  }

  // --- Delete customer by ID ---
  deleteCustomer(customerId: string): void {
    if (!confirm('Are you sure you want to delete this customer?')) return; 
    this.loaderService.show();
    this.customerApi.customerCustomerIdDelete(customerId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.show('Customer deleted successfully');
          this.fetchCustomers(); // Refresh customer list
        } 
        this.loaderService.hide();
      },
      error: (error:any) => {
        this.loaderService.hide();  
        this.notificationService.show('Failed to delete customer');
        console.error('Error deleting customer:', error);
      } 
    });
  }
}
