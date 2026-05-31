import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { NotificationService } from '../../../shared/notification.service';
import { CartService } from '../../../shared/cart.service';
import { OrdersApi, PaymentsApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { environment } from '../../../../environments/environment';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  standalone: true,
  selector: 'app-payment',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentMethod: 'stripe' | 'paypal' | null = null;
  orderId: string = '';
  isPaid: boolean | null = null; 

  private stripePublicKey = environment.stripePublicKey;
  private stripe!: Stripe | null;
  private elements!: StripeElements;
  private card!: StripeCardElement;
  private paymentInformation: any;
  

  constructor(private router: Router, private notification: NotificationService, public readonly cartService: CartService,
    private readonly loaderService: LoaderService, private readonly paymentApi: PaymentsApi,private route: ActivatedRoute,
    private orderService: OrdersApi
  ) { 
  
  }

  ngOnInit(): void {
     this.route.paramMap.subscribe(params => {
    const id = params.get('id');
      if(!id && !this.cartService.getOrderId()){
        this.router.navigate(['/']);
      }
      if(id && !this.cartService.getOrderId()){
        this.loaderService.show();
        this.orderService.orderOrderIdGet(id).subscribe({
          next:(response:any)=>{
            this.loaderService.hide();
            this.orderId = response.data._id;
            this.cartService.setOrderId(response.data._id);
            this.isPaid = response.data.status === 'confirmed';
            this.cartService.setTotalOrderCost(response.data.total);
          },
          error:()=>{
            this.loaderService.hide();
          }
        })
      }else{
        this.orderId = this.cartService.getOrderId();
        this.isPaid = false;
      }
    });
  
  }

  public async createStripePaymentIntent() {
    this.stripe = await loadStripe(this.stripePublicKey);
    let payload = {
      orderId: this.cartService.getOrderId(),
      currency: "eur"
    }
    this.loaderService.show();
    this.paymentApi.paymentStripeCreatePaymentIntentPost(payload).subscribe({
      next: (response) => {
        this.loaderService.hide();
        this.paymentInformation = response.data;
        console.log('Stripe Payment Intent Created:', response);
          if (this.stripe) {
        this.elements = this.stripe.elements();
        this.card = this.elements.create('card');
        this.card.mount('#card-element');
      }
      },
      error: (error) => {
        this.loaderService.hide();
        console.error('Error creating Stripe Payment Intent:', error);
        this.notification.show('Failed to create Stripe Payment Intent.', 'error');
      }
    });
  }

  public async pay() {
    if (!this.stripe || !this.paymentInformation.clientSecret) return;
    this.loaderService.show();
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.paymentInformation.clientSecret, {
      payment_method: { card: this.card }
    });

    if (error) {
      this.loaderService.hide();
      this.notification.show(error.message || 'something wentont', 'error');
    } else if (paymentIntent?.status === 'succeeded') {
      this.notification.show('Payment processed!');
      this.loaderService.hide();
      this.router.navigate(['/checkout/success']);
    }
  }

public async onPayPalSelected() {
  await this.loadPayPalScript();
  this.renderPayPalButton();
}

private renderPayPalButton() {
  // @ts-ignore
  window.paypal.Buttons({
    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          reference_id: this.cartService.getOrderId(), 
          amount: {
            value: this.cartService.getTotalOrderCost(),
            currency_code: 'EUR'
          },
          invoice_id: this.cartService.getOrderId(), 
        }]
      });
    },
    onApprove: async (data: any, actions: any) => {
      this.loaderService.show();
      const details = await actions.order.capture();
      let payload = {
        orderId: this.cartService.getOrderId(),
        status: details.status.toLowerCase(),
        paymentDetails: {
          transaction_id: details.id,
          paymentSource: {
            paypal: {
                email_address: details.payer.email_address,
                account_id: details.payer.payer_id,
            }
        },
        },
      }
      this.paymentApi.paymentPost(payload).subscribe({
        next: (response) => {
          this.loaderService.hide();
          this.notification.show('Payment processed!');
          this.router.navigate(['/customer/success']);
        }
      });
      
    },
    onError: (err: any) => {
      this.notification.show('PayPal payment failed.', 'error');
      console.error('PayPal error:', err);
    }
  }).render('#paypal-button-container');
}

  private loadPayPalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('paypal-sdk')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=EUR&locale=de_DE`;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

}
