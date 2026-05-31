import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthenticationApi, MealPlanningApi, NewsletterApi } from '../../api/api-kms-planner-masterdata';
import { UserService } from '../../shared/user.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { LoaderService } from '../../shared/loader/loader.service';
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../shared/notification.service';
import { CartService } from '../../shared/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginPromptComponent } from '../../shared/login-prompt/login-prompt.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    NavbarComponent,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  logoPath = 'assets/logo.png';
  user: any = null;
  subscriber = { email: '', firstName: '', lastName: '' };
  currentSlide = 0;
  meals: any[] = [];
  heroSlides = [
    { image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1350&q=80', title: 'Modern Kitchen Setup', subtitle: 'Efficiently manage your kitchen with ease' },
    { image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1350&q=80', title: 'Fresh Ingredients Daily', subtitle: 'Keep your meals fresh and healthy' },
    { image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1350&q=80', title: 'Professional Meal Planning', subtitle: 'Organize and optimize your kitchen workflow' }
  ];

  constructor(
    private readonly userService: UserService,
    private mealsPlannerApi: MealPlanningApi,
    private readonly loaderService: LoaderService,
    private newsletterApi: NewsletterApi,
    private readonly notificationService: NotificationService,
    private readonly cartService: CartService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.user = this.userService.getUserInfo();
  }

  ngOnInit(): void {
    this.loadMeals();
    setInterval(() => this.nextSlide(), 5000);
  }

  private loadMeals() {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    this.mealsPlannerApi.planningMealPlansGet(undefined, formattedDate).subscribe({
      next: (response: any) => {
        this.meals = response?.data?.flatMap((plan: any) => {
          if (!plan.meals) return [];
          return plan.meals.map((m: any) => {
            const meal = m.mealId;
            if (!meal || typeof meal === "string") return null;
            const firstImage = meal.images?.[0] || {};
            return {
              title: meal.title,
              description: meal.description,
              price: meal.price,
              servings: meal.servings,
              id: meal._id,
              image: firstImage.url || Object.values(firstImage).join(""),
              tags: meal.tags?.map((t: any) => t.name) || [],
              servingStart: m.servingStart,
              servingEnd: m.servingEnd
            };
          }).filter(Boolean);
        }) || [];
        this.meals = this.meals.slice(0, 3); // limit to 3 meals
        this.loaderService.hide();
      },
      error: () => this.loaderService.hide()
    });
  }

  isMealAvailable(meal: any): boolean {
    console.log(meal)
    if (!meal.servingStart || !meal.servingEnd) return true;
    const now = new Date();
    const [startH, startM] = meal.servingStart.split(':').map(Number);
    const [endH, endM] = meal.servingEnd.split(':').map(Number);

    const startTime = new Date(); startTime.setHours(startH, startM, 0, 0);
    const endTime = new Date(); endTime.setHours(endH, endM, 0, 0);

    return now >= startTime && now <= endTime;
  }

  async addToCart(meal: any) {
    if (!this.isMealAvailable(meal)) {
      this.notificationService.show(`This meal is only available from ${meal.servingStart} to ${meal.servingEnd}.`, 'error');
      return;
    }

    if (this.user === null) {
      const result = await this.dialog.open(LoginPromptComponent).afterClosed().toPromise();
      if (result) this.router.navigate(['/login']);
      else this.notificationService.show('Login is required to add to cart.', 'error');
      return;
    }

    if (this.userService.getUserInfo()?.role !== 'user') {
      this.notificationService.show('Only customers can add to cart.', 'error');
      return;
    }

    this.cartService.addToCart(meal.id, meal.title, meal.price, meal.image, meal.servings, 1);
    this.notificationService.show(`${meal.title} added to cart!`);
  }

  nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length; }
  goToSlide(index: number) { this.currentSlide = index; }

  getTagStyle(tag: any) {
    return {
      'background': tag.color ? tag.color : 'linear-gradient(90deg, #43a047, #81c784)',
      'color': '#fff',
      'font-weight': '600',
      'text-transform': 'uppercase',
      'padding': '3px 8px',
      'border-radius': '12px',
      'font-size': '0.75rem',
      'box-shadow': '0 2px 5px rgba(0,0,0,0.2)',
      'transition': 'transform 0.2s ease'
    };
  }

  subscribeNewsletter() {
    this.loaderService.show();
    this.newsletterApi.newsletterSubscribePost(this.subscriber).subscribe({
      next: (response) => {
        this.loaderService.hide();
        this.notificationService.show('Subscription successful! Thank you for subscribing to our newsletter.');
        this.subscriber = { email: '', firstName: '', lastName: '' };
      }, error: (error) => {
        this.loaderService.hide();
        this.notificationService.show('Subscription failed. Please try again later.');
        console.error('Newsletter subscription error:', error);
      }
    });
  }
}
