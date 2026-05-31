import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';
import { CartService } from '../../shared/cart.service';
import { BillingInfo, CustomerManagementApi, UserProfile } from '../../api/api-kms-planner-masterdata';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../shared/user.service';
import { LoaderService } from '../../shared/loader/loader.service';

@Component({
  standalone: true,
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
})
export class OrderPageComponent implements OnInit {
  orderForm!: FormGroup;
  countriesList: string[] = [
    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
  ];
  private userInfo: UserProfile | null = null;
  constructor(
    private router: Router,
    private notification: NotificationService,
    private fb: FormBuilder,
    private cartService: CartService,
    private readonly userService: UserService,
    private readonly loadingService: LoaderService,
    private customerApi: CustomerManagementApi,
    private notificationService: NotificationService,
  ) {
    if (this.cartService.getTotalItems() === 0) {
      this.router.navigate(['/checkout/cart']);
    }
  }

  ngOnInit(): void {
    this.userInfo = this.userService.getUserInfo();
    if (this.userInfo && this.userInfo._id) {
      this.getCustomerDetail(this.userInfo._id);
    }
    this.createCustomerInfoForm();
  }

  private createCustomerInfoForm() {
    this.orderForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      hausnumber: ['', Validators.required],
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\+\-\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      taxId: [''],
      country: ['', Validators.required]
    });
  }

  get f() {
    return this.orderForm.controls;
  }

  submitOrderInfo() {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      const billingInfo: BillingInfo = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        company: formValue.company,
        taxId: formValue.taxId,
        address: {
          street: `${formValue.street}.${formValue.hausnumber}`,
          city: formValue.city,
          zipCode: formValue.zipCode,
          country: formValue.country,
          state: formValue.state
        }
      };

      this.cartService.setCustomerBillingInfo(billingInfo);
      this.notification.show('Billing info saved!');
      this.router.navigate(['/checkout/shipping']);
    } else {
      this.notification.show('Please fill out all required fields correctly.', 'error');
      this.orderForm.markAllAsTouched();
    }
  }

  private getCustomerDetail(id: string) {
    this.loadingService.show();
    this.customerApi.customerUserUserIdGet(id).subscribe({
      next: (res: any) => {
        const data = res.data;
        if (data.billingInfo) {
          this.orderForm.patchValue({
            firstName: data.billingInfo.firstName,
            lastName: data.billingInfo.lastName,
            email: data.billingInfo.email,
            phone: data.billingInfo.phone || '',
            company: data.billingInfo.company || '',
            taxId: data.billingInfo.taxId || '',
            street: data.billingInfo.address?.street || '',
            city: data.billingInfo.address?.city || '',
            state: data.billingInfo.address?.state || '',
            zipCode: data.billingInfo.address?.zipCode || '',
            country: data.billingInfo.address?.country || ''
          });
        }
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.notificationService.show('Failed to load customer details. Please try again later.');
      }
    });
  }
}
