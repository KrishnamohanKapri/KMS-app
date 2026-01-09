import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealPlanningApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-weekly-meals',
  imports: [CommonModule, MatSnackBarModule, MatIconModule, MatSelectModule, ReactiveFormsModule, MatSliderModule,
    RouterModule, MatCheckboxModule, FormsModule, MatSelectModule, MatChipsModule, MatSlideToggleModule,],
  templateUrl: './weekly-meals.component.html',
  styleUrls: ['./weekly-meals.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WeeklyMealsComponent implements OnInit {
  weekMeals: any[] = [];

  filters: any = {
    dietaryInfo: {
      vegan: false,
      vegetarian: false,
      eggFree: false,
      fishFree: false,
      glutenFree: false,
      halal: false,
      kosher: false,
      lactoseFree: false,
      nutFree: false,
      soyFree: false
    },
    tags: {},
    categories: [] as string[],
    allergens: [] as string[],
    servings: 1,
    price: { min: 0, max: 100 }
  };

  dietaryKeys = Object.keys(this.filters.dietaryInfo);
  categories: string[] = [];
  allergens: string[] = [];
  minServings = 1;
  maxServings = 10;
  tags: string[] = [];

  constructor(
    private notification: NotificationService,
    private mealsPlannerApi: MealPlanningApi,
    private readonly loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.loadMeals();
  }

  private loadMeals() {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    firstDayOfWeek.setDate(today.getDate() - diffToMonday);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(firstDayOfWeek);
    const endDate = formatDate(lastDayOfWeek);

    this.loaderService.show();
    this.mealsPlannerApi.planningMealPlansGet('day', undefined, startDate, endDate).subscribe({
      next: (response) => {
        this.weekMeals = this.groupMealsByDate(response.data || []);
        this.extractFilterOptions();
        this.loaderService.hide();
      },
      error: () => {
        this.loaderService.hide();
      }
    });
  }

  private groupMealsByDate(plans: any[]) {
    const dateMap: { [key: string]: Map<string, any> } = {};

    plans.forEach(plan => {
      let startDate: Date;
      let endDate: Date;

      if (plan.type === 'day') {
        startDate = new Date(plan.date);
        endDate = new Date(plan.date);
      } else if (plan.type === 'week') {
        startDate = new Date(plan.startDate);
        endDate = new Date(plan.endDate);
      } else return;

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const key = this.formatDate(d);
        if (!dateMap[key]) dateMap[key] = new Map<string, any>();

        for (const m of plan.meals || []) {
          const meal = m.mealId;
          if (!meal || typeof meal === 'string') continue;

          const firstImage = meal.images?.[0] || {};
          const mealData = {
            id: meal._id,
            name: meal.title,
            description: meal.description,
            price: meal.price,
            servings: meal.servings,
            image: 'url' in firstImage ? firstImage.url : Object.values(firstImage).join(""),
            dietaryInfo: meal.dietaryInfo || {},
            category: meal.category || null,
            allergens: meal.allergens || [],
            tags: meal.tags?.map((t: any) => t.name) || []
          };

          if (dateMap[key].has(meal._id)) {
            const existing = dateMap[key].get(meal._id);
            existing.servings += m.servings;
            dateMap[key].set(meal._id, existing);
          } else {
            dateMap[key].set(meal._id, mealData);
          }
        }
      }
    });

    return Object.keys(dateMap)
      .sort()
      .map(dateStr => {
        const { day, date } = this.formatDayWithDate(dateStr);
        const mealsArray = Array.from(dateMap[dateStr].values());
        return {
          day,
          date,
          meals: mealsArray,
          filteredMeals: [...mealsArray]
        };
      });
  }

  private extractFilterOptions() {
    const catSet = new Set<string>();
    const allergenSet = new Set<string>();
    const tagSet = new Set<string>();
    let minS = Infinity;
    let maxS = -Infinity;

    this.weekMeals.forEach(day => {
      day.meals.forEach((meal: any) => {
        if (meal.category?.name) catSet.add(meal.category.name);
        if (meal.allergens?.length) meal.allergens.forEach((a: any) => allergenSet.add(a.name));
        if (meal.tags?.length) meal.tags.forEach((t: string) => tagSet.add(t));
        if (meal.servings) {
          minS = Math.min(minS, meal.servings);
          maxS = Math.max(maxS, meal.servings);
        }
      });
    });

    this.categories = Array.from(catSet);
    this.allergens = Array.from(allergenSet);
    this.tags = Array.from(tagSet);
    this.minServings = minS === Infinity ? 1 : minS;
    this.maxServings = maxS === -Infinity ? 10 : maxS;
    this.filters.servings = this.minServings;
  }

  toggleCategory(cat: string) {
    if (this.filters.categories.includes(cat)) {
      this.filters.categories = this.filters.categories.filter((c: string) => c !== cat);
    } else {
      this.filters.categories.push(cat);
    }
  }

  toggleAllergen(allergen: string) {
    if (this.filters.allergens.includes(allergen)) {
      this.filters.allergens = this.filters.allergens.filter((a: string) => a !== allergen);
    } else {
      this.filters.allergens.push(allergen);
    }
  }

  toggleTag(tag: string) {
    this.filters.tags[tag] = !this.filters.tags[tag];
  }

  toggleDietary(key: string) {
    this.filters.dietaryInfo[key] = !this.filters.dietaryInfo[key];
  }

  applyFilters() {
    this.weekMeals.forEach(day => {
      day.filteredMeals = day.meals.filter((meal: any) => {

        for (const key of Object.keys(this.filters.dietaryInfo)) {
          if (this.filters.dietaryInfo[key] && !meal.dietaryInfo[key]) return false;
        }

        if (this.filters.categories.length && !this.filters.categories.includes(meal.category?.name)) return false;

        if (this.filters.allergens.length && meal.allergens?.some((a: any) => this.filters.allergens.includes(a.name))) return false;

        const selectedTags = Object.keys(this.filters.tags).filter(t => this.filters.tags[t]);
        if (selectedTags.length && !selectedTags.some(t => meal.tags.includes(t))) return false;

        if (meal.servings < this.filters.servings) return false;

        if (meal.price > this.filters.price.max) return false;
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
    });
  }

  private formatDayWithDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    return { day, date: formattedDate };
  }

  private formatDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  getTagStyle(tag: any) {
    return {
      'background-color': tag.color || 'rgba(66, 165, 245, 0.9)',
      color: '#fff',
      'font-weight': '600',
      'text-transform': 'uppercase',
      padding: '3px 8px',
      'border-radius': '12px',
      'font-size': '0.75rem',
      'box-shadow': '0 2px 5px rgba(0,0,0,0.2)'
    };
  }
}
