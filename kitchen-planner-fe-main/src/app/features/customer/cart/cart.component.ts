import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginPromptComponent } from '../../../shared/login-prompt/login-prompt.component';
import { NotificationService } from '../../../shared/notification.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { LoaderService } from '../../../shared/loader/loader.service';
import { MealPlanningApi, OrdersApi } from '../../../api/api-kms-planner-masterdata';
import { CartService } from '../../../shared/cart.service';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    MatDialogModule,
    MatButtonModule,
    LoginPromptComponent, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  meals: any[] = [];
  isLoggedIn = false;
  selectedMeal: string = '';
  quantity: number = 1;
  cartTotals: { total?: number; subTotal?: number; tax?: number } = { total: 0, subTotal: 0, tax: 0 };

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private readonly notification: NotificationService,
    private readonly loaderService: LoaderService,
    private readonly orderApi: OrdersApi,
    public readonly cartService: CartService,
    private mealsPlannerApi: MealPlanningApi
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.cartItems = this.cartService.getCart();
    if (this.cartItems.length > 0 && this.isLoggedIn) {
      this.totalItemCost();
    }
    this.loadMeals();
  }

  async addMeal() {
    if (!this.selectedMeal) return;

    if (!this.isLoggedIn) {
      const result = await this.dialog.open(LoginPromptComponent).afterClosed().toPromise();
      if (result) this.router.navigate(['/login']);
      else this.notification.show('Login is required to add to cart.', 'error');
      return;
    }

    const meal: any = this.meals.find(m => m.title === this.selectedMeal);
    const existing = this.cartItems.find(item => item._id === meal?.id);
    if (+meal.servings >= +this.quantity) {
      if (existing) existing.qty += this.quantity;
      else this.cartItems.push({ name: meal.title, price: meal.price, qty: this.quantity, _id: meal.id });
      this.selectedMeal = '';
      this.quantity = 1;
      this.notification.show('Meal added to cart!');
      this.totalItemCost();
    } else {
      this.notification.show(`Only ${meal.servings} servings available.`, 'error');
    }
  }

  // Remove individual meal
  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.cartService.setCart(this.cartItems);
    this.totalItemCost();
    this.notification.show('Meal removed from cart.');
  }

  // Clear entire cart
  clearCart() {
    this.cartItems = [];
    this.cartService.clearCart();
    this.cartTotals = { total: 0, subTotal: 0, tax: 0 };
    this.notification.show('Cart cleared.');
  }

  proceedToInfo() {
    if (this.cartItems.length === 0) {
      this.notification.show('Your cart is empty. Please add items before proceeding.', 'error');
      return;
    }
    this.cartService.setSubtotal(this.cartTotals.subTotal || 0);
    this.cartService.setTotalTaxCost(this.cartTotals.tax || 0);
    this.cartService.setTotalOrderCost(this.cartTotals.total || 0);
    this.router.navigate(['/checkout/billing']);
  }

  increaseQty(item: any) {
  if (item.qty < item.maxQty) {
    item.qty++;
    this.updateCartTotals();
  }
}

decreaseQty(item: any) {
  if (item.qty > 1) {
    item.qty--;
    this.updateCartTotals();
  }
}

addMealFromCard(meal: any) {
  if (!this.isLoggedIn) {
    this.dialog.open(LoginPromptComponent);
    return;
  }
  const qty = meal.selectedQty || 1;
  if (qty > meal.servings) {
    this.notification.show(`Only ${meal.servings} servings available.`, 'error');
    return;
  }
  const existing = this.cartItems.find(item => item._id === meal.id);
  if (existing) existing.qty += qty;
  else this.cartItems.push({ name: meal.title, price: meal.price, qty, _id: meal.id });
  meal.selectedQty = 1;
  this.cartService.setCart(this.cartItems);
  this.totalItemCost();
  this.notification.show('Meal added to cart!');
}

private updateCartTotals() {
  let payload = {
    arrayOfMeals: this.cartItems.map(item => ({ _id: item._id, qty: item.qty }))
  };
  this.orderApi.orderCartCheckoutPost(payload).subscribe({
    next: (res) => {
      if(res!.data){
        this.cartTotals = res!.data!;
      }
    },
    error: () => {
      this.notification.show('Failed to update totals.', 'error');
    }
  });
}

  private totalItemCost() {
    this.loaderService.show();
    const payload = { arrayOfMeals: this.cartItems.map(item => ({ _id: item._id, qty: item.qty })) };
    this.orderApi.orderCartCheckoutPost(payload).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res?.data) this.cartTotals = res.data;
      },
      error: () => {
        this.loaderService.hide();
        this.notification.show('Failed to get cart totals. Please try again.', 'error');
      }
    });
  }

  private loadMeals() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.mealsPlannerApi.planningMealPlansGet(undefined, formattedDate).subscribe({
      next: (res: any) => {
        this.meals = res?.data?.flatMap((plan:any) => plan.meals?.map((m: { mealId: { title: any; price: any; _id: any; }; servings: any; }) => ({
          title: m.mealId?.title,
          price: m.mealId?.price,
          servings: m.servings,
          id: m.mealId?._id
        })) || []) || [];
        this.loaderService.hide();
      },
      error: () => this.loaderService.hide()
    });
  }
}
