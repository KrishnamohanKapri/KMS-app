import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { NotificationService } from '../../shared/notification.service';
import { MealPlanningApi } from '../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../shared/loader/loader.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MatDialog } from '@angular/material/dialog';
import { LoginPromptComponent } from '../../shared/login-prompt/login-prompt.component';
import { CartService } from '../../shared/cart.service';
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from "@angular/material/slider";

@Component({
  standalone: true,
  selector: 'app-meals-list',
  templateUrl: './meals-list.component.html',
  styleUrls: ['./meals-list.component.css'],
  imports: [
    CommonModule, MatSnackBarModule, NavbarComponent, MatIconModule,
    MatSelectModule, ReactiveFormsModule, MatSliderModule, RouterModule,
    MatCheckboxModule, FormsModule, MatChipsModule, MatSlideToggleModule
  ],
})
export class MealsListComponent implements OnInit {

  isLoggedIn = false;
  filters: any = {
    dietaryInfo: {
      vegan: false, vegetarian: false, eggFree: false,
      fishFree: false, glutenFree: false, halal: false,
      kosher: false, lactoseFree: false, nutFree: false, soyFree: false
    },
    tags: {},
    categories: [] as string[],
    mealType: [] as string[],
    allergens: [] as string[],
    servings: 1,
    price: { min: 0, max: 100 },
    showPreferences: false
  };

  dietaryKeys = Object.keys(this.filters.dietaryInfo);
  categories: string[] = [];
  mealType: string[] = ['breakfast', 'lunch', 'dinner'];
  allergens: string[] = [];
  minServings = 1;
  maxServings = 10;
  tags: string[] = [];

  originalMeals: any[] = [];
  meals: any[] = [];

  mealsGrouped: Record<string, any[]> = {};
  mealGroupsKeys: string[] = [];

  constructor(
    public userService: UserService,
    private router: Router,
    private notification: NotificationService,
    private mealsPlannerApi: MealPlanningApi,
    private readonly loaderService: LoaderService,
    private dialog: MatDialog,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.loadMeals();
  }

  increaseQty(meal: any) {
    if (meal.quantity < meal.stock) meal.quantity++;
  }

  decreaseQty(meal: any) {
    if (meal.quantity > 1) meal.quantity--;
  }

  public isWithinServingTime(meal: any): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string, defaultMinutes: number) => {
        if (!timeStr) return defaultMinutes;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const start = parseTime(meal.servingStart, 7 * 60); 
    const end = parseTime(meal.servingEnd, 22 * 60); 
    if (start <= end) {
        return currentMinutes >= start && currentMinutes <= end;
    } else {
      
        return currentMinutes >= start || currentMinutes <= end;
    }
}

  async addToCart(meal: any) {
    if (!this.isWithinServingTime(meal)) {
      this.notification.show("Meals can only be ordered between 7:00–22:00", 'error');
      return;
    }

    if (!this.isLoggedIn) {
      const result = await this.dialog.open(LoginPromptComponent).afterClosed().toPromise();
      if (result) this.router.navigate(['/login']);
      else this.notification.show('Login is required to add to cart.', 'error');
      return;
    }

    if (this.userService.getUserInfo()?.role !== 'user') {
      this.notification.show('Only customers can add to cart.', 'error');
      return;
    }

    if (meal.quantity > meal.stock) {
      this.notification.show(`Only ${meal.stock} in stock.`, 'error');
      return;
    }

    this.cartService.addToCart(meal.id, meal.name, meal.price, meal.image, meal.stock, meal.quantity);
    this.notification.show(`${meal.quantity} x ${meal.name} added to cart!`);
  }

  private loadMeals() {
    this.loaderService.show();
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    this.mealsPlannerApi.planningMealPlansGet(undefined, formattedDate).subscribe({
      next: (response: any) => {
        const mealMap = new Map<string, any>();
        const plans = response?.data || [];

        for (const plan of plans) {
          if (!plan.meals) continue;
          for (const m of plan.meals) {
            const meal = m.mealId;
            if (!meal || typeof meal === "string") continue;

            const firstImage = meal.images?.[0] || {};
            const mealData = {
              name: meal.title,
              description: meal.description,
              price: meal.price,
              stock: meal.servings,
              servings: meal.servings,
              id: meal._id,
              quantity: 1,
              image: firstImage.url || Object.values(firstImage).join(""),
              dietaryInfo: meal.dietaryInfo || {},
              category: meal.category,
              allergens: meal.allergens || [],
              tags: meal.tags?.map((t: any) => t.name) || [],
              mealType: m.mealType,
              servingStart: m.servingStart,
              servingEnd: m.servingEnd,
              cookTime: m.cookTime || '60'
            };

            if (mealMap.has(meal._id)) {
              const existing = mealMap.get(meal._id);
              existing.stock += m.servings;
              mealMap.set(meal._id, existing);
            } else mealMap.set(meal._id, mealData);
          }
        }

        this.originalMeals = Array.from(mealMap.values());
        this.applyFilters();
        this.updateCategoriesAndAllergens();
        this.loaderService.hide();
      },
      error: () => this.loaderService.hide()
    });
  }

  private updateCategoriesAndAllergens() {
    const catSet = new Set<string>();
    const allergenSet = new Set<string>();
    let minS = Infinity;
    let maxS = -Infinity;

    this.originalMeals.forEach(meal => {
      if (meal.category?.name) catSet.add(meal.category.name);
      if (meal.allergens?.length) meal.allergens.forEach((a: any) => allergenSet.add(a.name));
      if (meal.servings) {
        minS = Math.min(minS, meal.servings);
        maxS = Math.max(maxS, meal.servings);
      }
    });

    this.categories = Array.from(catSet);
    this.allergens = Array.from(allergenSet);
    this.minServings = minS === Infinity ? 1 : minS;
    this.maxServings = maxS === -Infinity ? 10 : maxS;
    this.tags = Array.from(new Set(this.originalMeals.flatMap(m => m.tags)));

    this.groupMeals();
  }

  private groupMeals() {
    this.mealsGrouped = this.meals.reduce((groups: any, meal: any) => {
      const mealType = meal.mealType || "General";
      if (!groups[mealType]) groups[mealType] = [];
      groups[mealType].push(meal);
      return groups;
    }, {});
    this.mealGroupsKeys = Object.keys(this.mealsGrouped);
  }

  toggleCategory(cat: string) {
    if (this.filters.categories.includes(cat)) this.filters.categories = this.filters.categories.filter((c:any) => c !== cat);
    else this.filters.categories.push(cat);
  }

  toggleMealType(mealType: string) {
    if (this.filters.mealType.includes(mealType)) this.filters.mealType = this.filters.mealType.filter((m:any) => m !== mealType);
    else this.filters.mealType.push(mealType);
  }

  toggleAllergen(allergen: string) {
    if (this.filters.allergens.includes(allergen)) this.filters.allergens = this.filters.allergens.filter((a:any) => a !== allergen);
    else this.filters.allergens.push(allergen);
  }

  applyFilters() {
    this.meals = this.originalMeals.filter(meal => {
      for (const key of Object.keys(this.filters.dietaryInfo)) {
        if (this.filters.dietaryInfo[key] && !meal.dietaryInfo[key]) return false;
      }
      if (this.filters.categories.length && !this.filters.categories.includes(meal.category?.name)) return false;
      if (this.filters.mealType.length && !this.filters.mealType.includes(meal.mealType)) return false;
      const selectedTags = Object.keys(this.filters.tags).filter(t => this.filters.tags[t]);
      if (selectedTags.length && !selectedTags.some(t => meal.tags.includes(t))) return false;

      if (this.filters.allergens.length && meal.allergens?.some((a: any) => this.filters.allergens.includes(a.name))) return false;

      if (meal.servings < this.filters.servings) return false;
      if (meal.price > this.filters.price.max) return false;

       // Show My Preferences
       if (this.filters.showPreferences) {
      const prefsRaw = localStorage.getItem('preferences');
      if (prefsRaw) {
        const prefs = JSON.parse(prefsRaw);

        if (prefs.dietaryRestrictions?.length) {
          if (!prefs.dietaryRestrictions.every((restriction: string) => meal.dietaryInfo[restriction])) return false;
        }

        if (prefs.allergies?.length) {
          if (meal.allergens?.some((a: any) => prefs.allergies.includes(a.name))) return false;
        }
      }
    }
      return true;
    });

    this.groupMeals();
  }

  getTagClass(tag: string) {
    return tag.toLowerCase().replace(/ /g, '-');
  }
}
