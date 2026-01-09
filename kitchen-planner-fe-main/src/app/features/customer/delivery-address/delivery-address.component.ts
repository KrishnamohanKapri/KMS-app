import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryAddress, OrderCreate, OrdersApi } from '../../../api/api-kms-planner-masterdata';
import { CartService } from '../../../shared/cart.service';
import { NotificationService } from '../../../shared/notification.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { LoaderService } from '../../../shared/loader/loader.service';
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-delivery-address',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NavbarComponent,
    MatCheckboxModule,
    MatIconModule
],
  templateUrl: './delivery-address.component.html',
  styleUrl: './delivery-address.component.css'
})
export class DeliveryAddressComponent {
  deliveryForm!: FormGroup;
  sameAsBilling = false;
  countriesList: string[] = [
    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
  ];
  constructor(private router: Router, private notification: NotificationService, private fb: FormBuilder,
    private cartService: CartService, private readonly orderApi: OrdersApi, private loaderService: LoaderService,) {
    if(this.cartService.getTotalItems() === 0){
      this.router.navigate(['/customer/cart']);
    }
  }

  ngOnInit(): void {
    this.createCustomerInfoForm();
  }

  private createCustomerInfoForm() {
    this.deliveryForm = this.fb.group({
      street: ['', Validators.required],
      state: ['', Validators.required],
      hausnumber: ['', Validators.required],
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      instructions: [''],
      specialInstructions: [''],
      country: ['', Validators.required],
    });
  }

  get f() {
    return this.deliveryForm.controls;
  }

  submitDeliveryInfo() {
    if (this.deliveryForm.valid) {
      const formValue = this.deliveryForm.value;
      const deliveryAddressInfo: DeliveryAddress = {
          street: `${formValue.street} ${formValue.hausnumber}`,
          city: formValue.city,
          zipCode: formValue.zipCode,
          country: formValue.country,
          state: formValue.state,
          instructions: formValue.instructions
      };

      this.cartService.setCustomerDeliveryInfo(deliveryAddressInfo);
      this.cartService.setSpecialInstructions(formValue.specialInstructions || '');
      this.placeOrder();
    } else {
      this.notification.show('Please fill out all required fields correctly.', 'error');
      this.deliveryForm.markAllAsTouched();
    }
  }

  private placeOrder() {
    const billingInfo = this.cartService.getCustomerBillingInfo();
    const deliveryInfo = this.cartService.getCustomerDeliveryInfo();
    const specialInstructions = this.cartService.getSpecialInstructions();
    if (!billingInfo || !deliveryInfo) {
      this.notification.show('Billing or Delivery information is missing.', 'error');
      return;
    }

    const orderPayload:OrderCreate = {
      meals: this.cartService.cartItems.map(item => ({
        _id: item._id,
        qty: item.qty
      })),
      billingInfo: billingInfo,
      deliveryAddress: deliveryInfo,
      specialInstructions: specialInstructions,
      total: this.cartService.getTotalOrderCost(),
      tax: this.cartService.getTotalTaxCost(),
      subTotal: this.cartService.getSubtotal(),
      deliveryFee: this.cartService.getDeliveryFee(),
      discount: this.cartService.getDiscount()
    };

    this.loaderService.show();
    this.orderApi.orderPost(orderPayload).subscribe({
      next: (response) => {
        this.loaderService.hide();
        this.cartService.setOrderId(response!.data!._id!);
        this.notification.show('Delivery info saved!');
        this.router.navigate(['/checkout/payment']);
      },
      error: (err) => {
        this.loaderService.hide();
        this.notification.show('Failed to place order. Please try again.', 'error');
        console.error('Order placement error:', err);
      }
    });
  }

toggleSameAsBilling(event: MatCheckboxChange) {
  this.sameAsBilling = event.checked;

  if (this.sameAsBilling) {
    this.deliveryForm.patchValue({
      street: this.cartService.getCustomerBillingInfo()?.address?.street?.split('.')[0],
      hausnumber: this.cartService.getCustomerBillingInfo()?.address?.street?.split('.')[1],
      zipCode: this.cartService.getCustomerBillingInfo()?.address?.zipCode,
      city: this.cartService.getCustomerBillingInfo()?.address?.city,
      state: this.cartService.getCustomerBillingInfo()?.address?.state,
      country: this.cartService.getCustomerBillingInfo()?.address?.country,
    });

    // Object.keys(this.deliveryForm.controls).forEach(key => {
    //   if (key !== 'sameAsBilling') this.deliveryForm.get(key)?.disable();
    // });
  } else {
    // Object.keys(this.deliveryForm.controls).forEach(key => {
    //   if (key !== 'sameAsBilling') this.deliveryForm.get(key)?.enable();
    // });
    this.deliveryForm.patchValue({
      street: '',
      hausnumber: '',
      zipCode: '',
      city: '',
      state: '',
      country: '',
    });
  }
}

toggleSameAsBillingForm() {
  this.sameAsBilling = !this.sameAsBilling;
  this.toggleSameAsBilling({ checked: this.sameAsBilling } as MatCheckboxChange);
}

}
