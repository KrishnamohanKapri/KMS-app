import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { WeeklyMealsComponent } from '../weekly-meals/weekly-meals.component'
import { MealsListComponent } from '../meals-list.component';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";

@Component({
  selector: 'app-meals-dashboard',
  imports: [MatTabsModule, MealsListComponent, WeeklyMealsComponent, NavbarComponent],
  templateUrl: './meals-dashboard.component.html',
  styleUrl: './meals-dashboard.component.css'
})
export class MealsDashboardComponent {

}
