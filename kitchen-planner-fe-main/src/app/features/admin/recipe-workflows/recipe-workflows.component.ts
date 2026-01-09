import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../shared/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MealsApi } from '../../../api/api-kms-planner-masterdata';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NotificationService } from '../../../shared/notification.service';

@Component({
  standalone: true,
  selector: 'app-recipe-workflows',
  templateUrl: './recipe-workflows.component.html',
  styleUrls: ['./recipe-workflows.component.css'],
  imports: [CommonModule, NavbarComponent, FormsModule,
      MatButtonModule,
      MatIconModule,
      MatFormFieldModule,
      MatInputModule]
})
export class RecipeWorkflowsComponent implements OnInit {
  role: 'admin' | 'chef' = 'chef';

  recipes: any[] = [];

  selectedRecipeIndex: number = 0;

  constructor(private readonly userService: UserService, private readonly mealsApi: MealsApi,
    private readonly loaderService: LoaderService, private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getUserInfo();
    if (user) {
      this.role = user.role as 'admin' | 'chef';
    }
    this.getMeals();
  }

  addStep() {
    if (this.role !== 'admin') return;
    this.recipes[this.selectedRecipeIndex].steps.push({ text: 'New step', done: false, editing: false });
  }

  deleteStep(stepIndex: number) {
    if (this.role !== 'admin') return;
    this.recipes[this.selectedRecipeIndex].steps.splice(stepIndex, 1);
  }

  startEditStep(step: any) {
    if (this.role !== 'admin') return;
    step.editing = true;
  }

  saveStep(step: any) {
    step.editing = false;
  }

  // Optional: Add recipe (admin only)
  addRecipe() {
    if (this.role !== 'admin') return;
    this.recipes.push({
      title: 'New Recipe',
      steps: [], // For demo, new recipes start with empty steps
    });
    this.selectedRecipeIndex = this.recipes.length - 1;
  }

  // Optional: Delete recipe (admin only)
  deleteRecipe() {
    if (this.role !== 'admin') return;
    if (this.recipes.length === 0) return;
    this.recipes.splice(this.selectedRecipeIndex, 1);
    this.selectedRecipeIndex = 0;
  }

  private getMeals() {
    this.loaderService.show();
    this.mealsApi.mealsGet(1, 10).subscribe({
      next: (response: any) => {
        const stepsMap: { [title: string]: any[] } = {
          'Chicken Karahi': [
            { text: 'Cut chicken into pieces', done: false, editing: false },
            { text: 'Prepare masala', done: false, editing: false },
            { text: 'Cook chicken in masala', done: false, editing: false },
            { text: 'Garnish and serve', done: false, editing: false },
          ],
          'Butter Chicken with Naan': [
            { text: 'Marinate chicken', done: false, editing: false },
            { text: 'Prepare butter sauce', done: false, editing: false },
            { text: 'Cook chicken in sauce', done: false, editing: false },
            { text: 'Serve with naan', done: false, editing: false },
          ],
          'Chicken Alfredo Pasta': [
            { text: 'Boil pasta', done: false, editing: false },
            { text: 'Grill chicken', done: false, editing: false },
            { text: 'Prepare Alfredo sauce', done: false, editing: false },
            { text: 'Mix and serve', done: false, editing: false },
          ],
          'Spaghetti Pomodoro': [
            { text: 'Boil spaghetti', done: false, editing: false },
            { text: 'Prepare tomato sauce', done: false, editing: false },
            { text: 'Mix and cook', done: false, editing: false },
            { text: 'Serve with basil', done: false, editing: false },
          ],
          'Chole (Chickpea Curry) with Rice': [
            { text: 'Soak chickpeas', done: false, editing: false },
            { text: 'Prepare curry base', done: false, editing: false },
            { text: 'Cook chickpeas in curry', done: false, editing: false },
            { text: 'Serve with rice', done: false, editing: false },
          ],
          'Chicken Tikka Pizza': [
            { text: 'Prepare pizza dough', done: false, editing: false },
            { text: 'Spread sauce', done: false, editing: false },
            { text: 'Add toppings', done: false, editing: false },
            { text: 'Bake pizza', done: false, editing: false },
          ],
          'Avocado Toast with Poached Egg': [
            { text: 'Toast bread', done: false, editing: false },
            { text: 'Smash avocado', done: false, editing: false },
            { text: 'Poach egg', done: false, editing: false },
            { text: 'Assemble and serve', done: false, editing: false },
          ],
          'Vegetable Fried Rice': [
            { text: 'Chop vegetables', done: false, editing: false },
            { text: 'Cook rice', done: false, editing: false },
            { text: 'Stir-fry vegetables', done: false, editing: false },
            { text: 'Mix rice and serve', done: false, editing: false },
          ],
          'Omelette ': [
            { text: 'Beat eggs', done: false, editing: false },
            { text: 'Add fillings', done: false, editing: false },
            { text: 'Cook on pan', done: false, editing: false },
            { text: 'Fold and serve', done: false, editing: false },
          ],
        };

        this.recipes = (response.data || []).map((meal: any) => ({
          title: meal.title,
          steps: stepsMap[meal.title] ? [...stepsMap[meal.title]] : [],
        }));
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error fetching meals:', error);
        this.loaderService.hide();
        this.notificationService.show('Failed to load meals', 'error');
      }
    });
  }
}