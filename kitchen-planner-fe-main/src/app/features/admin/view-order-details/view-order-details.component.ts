import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { HistoryApi, Order, OrdersApi, PaymentsApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { UpdateOrderStatusDialogComponent } from './update-order-status-dialog/update-order-status-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../shared/user.service';
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DeliveryComponent } from '../../delivery/delivery.component';

@Component({
  selector: 'app-view-order-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatButtonModule,
    RouterModule,
    NgClass,
    TitleCasePipe,
    DatePipe,
    DeliveryComponent
  ],
  templateUrl: './view-order-details.component.html',
  styleUrl: './view-order-details.component.css'
})
export class ViewOrderDetailsComponent implements OnInit, OnDestroy {
  order: any = {}
  payments: any;
  userRole: string | null = null;
  orderTimelineList: any[] = [];
  locationUpdateIntervalHandle: any = undefined;
  @ViewChild('printArea') printArea!: ElementRef<HTMLElement>;
  constructor(private loaderService: LoaderService, private readonly notificationService: NotificationService,
    private readonly orderApi: OrdersApi, private route: ActivatedRoute, private readonly paymentApi: PaymentsApi,
    private dialog: MatDialog, private readonly userService: UserService, private historyApi: HistoryApi,
    private readonly location: Location,
    private http: HttpClient
  ) { }


  ngOnDestroy(): void {
    if (this.locationUpdateIntervalHandle) {
      clearInterval(this.locationUpdateIntervalHandle);
    }
  }

  ngOnInit() {
    this.userRole = this.userService.getUserInfo()?.role || null;
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchOrder(id);
        this.fetchPayment(id);
        if(this.userRole !== "rider"){
        this.orderTimeline(id);
        }
      }
    });
  }


  getSerializedOrderDeliveryAddress() {
    if (!this.order) return ""
    const { street, city, state, zipCode, country } = this.order.deliveryAddress;
    return `${street}, ${zipCode} ${city}, ${state}, ${country}`;
  }

  private fetchOrder(order: string) {
    this.loaderService.show();
    this.orderApi.orderOrderIdGet(order).subscribe({
      next: (response: any) => {
        this.order = response.data;
        this.sendDeliveryUpdates();
        this.loaderService.hide();
      },
      error: (error) => {
        this.notificationService.show('Failed to load order details', 'error');
        this.loaderService.hide();
      }
    });
  }

  private sendDeliveryUpdates() {
    // TODO: move the following logic into appropriate service
    if (this.locationUpdateIntervalHandle) {
      clearInterval(this.locationUpdateIntervalHandle);
    }

    if (this.userRole !== "rider") return;

    const updateLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            this.http.post(`${environment.apiUrl}/order/delivery-location`, { location: [latitude, longitude], orderId: this.order._id })
              .subscribe({
                next: (data) => {
                  console.log(data);
                },
                error: (err) => {
                  this.notificationService.show(err.message ? err.message : err.toString(), 'error');
                }
              })
          },
          (error) => {
            this.notificationService.show(`Location access is required to provide user with delivery location, error: ${error.message}`, 'error');
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    }

    this.locationUpdateIntervalHandle = setInterval(updateLocation.bind(this), 5000);
  }

  private fetchPayment(orderId: string) {
    this.loaderService.show();
    this.paymentApi.paymentOrderOrderIdGet(orderId).subscribe({
      next: (response: any) => {
        this.payments = response.data;
        this.loaderService.hide();
      },
      error: (error) => {
        this.notificationService.show('Failed to load payment details', 'error');
        this.loaderService.hide();
      }
    });
  }

  private orderHistory(id: string): void {
    const history = [];
    this.loaderService.show();
    this.historyApi.historyOrdersOrderIdHistoryGet(id).subscribe({
      next: (response: any) => {
        response.data.forEach((entry: any) => {
          history.push(`${new Date(entry.timestamp).toLocaleString()}: Status changed to "${entry.status}"`);
        });
        this.loaderService.hide();
      },
      error: (error) => {
        this.notificationService.show('Failed to load order history', 'error');
        this.loaderService.hide();
      }
    });
  }

  private orderTimeline(id: string): void {
    this.loaderService.show();
    this.historyApi.historyOrdersOrderIdTimelineGet(id).subscribe({
      next: (response: any) => {
        this.orderTimelineList = response.data;
        this.loaderService.hide();
      },
      error: (error) => {
        this.notificationService.show('Failed to load order history', 'error');
        this.loaderService.hide();
      }
    });
  }

  getStatusClass(status: string): string {
    return 'timeline-item ' + (status?.toLowerCase().replace(/ /g, '_') || '');
  }

  openUpdateStatusDialog() {
    const dialogRef = this.dialog.open(UpdateOrderStatusDialogComponent, {
      data: { currentStatus: this.order.status },
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== this.order.status) {
        this.loaderService.show();
        this.orderApi.orderUpdateStatusOrderIdPut(this.order._id, { status: result }).subscribe({
          next: () => {
            this.notificationService.show('Order status updated!', 'success');
            this.fetchOrder(this.order._id);
            this.loaderService.hide();
          },
          error: () => {
            this.notificationService.show('Failed to update status', 'error');
            this.loaderService.hide();
          }
        });
      }
    });
  }

  public goBack() {
    this.location.back();
  }

  public printSection() {
    if (!this.printArea) return;

    // Clone the component HTML
    const content = this.printArea.nativeElement.cloneNode(true) as HTMLElement;

    // Open a new window
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    // Include global & Angular Material styles
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(s => (s as HTMLElement).outerHTML)
      .join('\n');

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Component</title>
          ${styles}
          <style>
            @page { size: A4; margin: 16mm; }
            body { font-family: Roboto, Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${content.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for window to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // printWindow.close();
    };
  }

  public formatStatusClass(status: string): string {
    return status.replace(/ /g, '_').toLowerCase();
  }
}

