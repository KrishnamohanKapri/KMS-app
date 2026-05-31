import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MealsApi } from '../../../api/api-kms-planner-masterdata';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { LoginPromptComponent } from '../../../shared/login-prompt/login-prompt.component';
import { UserService } from '../../../shared/user.service';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../../../shared/cart.service';

@Component({
  selector: 'app-meal-details',
  imports: [MatCardModule, MatIconModule, CommonModule, NavbarComponent],
  templateUrl: './meal-details.component.html',
  styleUrl: './meal-details.component.css'
})
export class MealDetailsComponent {
  meal: any;
  mealId!: string;

  constructor(private route: ActivatedRoute, private readonly mealsApi: MealsApi, private loaderService: LoaderService,
    private readonly notificationService: NotificationService, private readonly userService: UserService,
    private router: Router, private readonly dialog: MatDialog, private readonly cartService: CartService
  ) { }

  ngOnInit(): void {
    this.mealId = this.route.snapshot.paramMap.get('id')!;
    this.fetchMeal();
  }

  fetchMeal() {
    this.loaderService.show();
    this.mealsApi.mealsMealIdGet(this.mealId).subscribe({
      next: (response) => {
        this.loaderService.hide();
        this.meal = response.data;
      },
      error: (error) => {
        this.notificationService.show(error.error.message, 'error');
        this.loaderService.show();
      }
    })
  }

  getTagStyle(tag: any) {
    return {
      'background-color': tag.color,
      'color': '#fff',
      'padding': '2px 10px',
      'border-radius': '12px',
      'font-size': '12px',
      'margin-right': '6px'
    };
  }

  getDietaryClass(isAvailable?: boolean): string {
    return isAvailable ? 'available' : 'not-available';
  }

  increaseQty(meal: any) {
    if (meal.quantity < meal.stock) {
      meal.quantity++;
    }
  }

  decreaseQty(meal: any) {
    if (meal.quantity > 1) {
      meal.quantity--;
    }
  }

  async addToCart(meal: any) {
    if (!this.userService.getUserInfo()) {
      const result = await this.dialog.open(LoginPromptComponent).afterClosed().toPromise();

      if (result) {
        this.router.navigate(['/login']);
      } else {
        this.notificationService.show('Login is required to add to cart.', 'error');
      }
      return;
    } else {
      if (this.userService.getUserInfo()?.role !== 'user') {
        this.notificationService.show('Only customers can add to cart.', 'error');
        return;
      }
      if (meal.quantity > meal.stock) {
        this.notificationService.show(`Only ${meal.stock} in stock.`, 'error');
        return;
      }
      this.cartService.addToCart(meal._id, meal.title, meal.price, meal.images[0].url, meal.servings, 1);
      this.notificationService.show(`${meal.title} added to cart!`);
    }
  }
}